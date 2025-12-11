use js_sys::{Array, Map, Number, Uint16Array};
use rustc_hash::FxHashMap;
use wasm_bindgen::prelude::*;

// CuboidData - Matches TypeScript type:
// export type CuboidData = {
//   groups: Map<number, number[]>;
//   cuboidsArray: Uint16Array;
// };
#[wasm_bindgen]
pub struct CuboidData {
    /// Internal storage for cuboids
    cuboids_array: Vec<u16>,
    /// Internal storage for groups
    groups: FxHashMap<u32, Vec<u32>>,
}

#[wasm_bindgen]
impl CuboidData {
    /// Get the cuboids array as Uint16Array
    #[wasm_bindgen(getter, js_name = "cuboidsArray")]
    pub fn cuboids_array(&self) -> Uint16Array {
        Uint16Array::from(&self.cuboids_array[..])
    }

    /// Get groups as a JavaScript Map<number, number[]>
    #[wasm_bindgen(getter)]
    pub fn groups(&self) -> Map {
        let map = Map::new();
        for (&group_id, cuboid_ids) in &self.groups {
            let js_array = Array::new();
            for &id in cuboid_ids {
                js_array.push(&Number::from(id));
            }
            map.set(&Number::from(group_id), &js_array);
        }
        map
    }
}

const OFFSET: usize = 7;

/// Check if two cuboids are face-adjacent
/// Takes slices directly to avoid repeated index calculations
#[inline(always)]
fn are_face_adjacent(a: &[u16], b: &[u16]) -> bool {
    // a and b are slices of length OFFSET: [id, x1, y1, z1, x2, y2, z2]
    // Indices: 0=id, 1=x1, 2=y1, 3=z1, 4=x2, 5=y2, 6=z2

    // X-face: x coordinates touch, y and z ranges overlap
    if (a[4] == b[1] || b[4] == a[1]) && a[5] > b[2] && b[5] > a[2] && a[6] > b[3] && b[6] > a[3] {
        return true;
    }

    // Y-face: y coordinates touch, x and z ranges overlap
    if (a[5] == b[2] || b[5] == a[2]) && a[4] > b[1] && b[4] > a[1] && a[6] > b[3] && b[6] > a[3] {
        return true;
    }

    // Z-face: z coordinates touch, x and y ranges overlap
    if (a[6] == b[3] || b[6] == a[3]) && a[4] > b[1] && b[4] > a[1] && a[5] > b[2] && b[5] > a[2] {
        return true;
    }

    false
}

/// Find all connected cuboids starting from a given cuboid (iterative to avoid stack overflow)
/// Uses a pre-allocated visited array instead of HashSet for better performance
#[inline]
fn find_connected(
    cuboids_array: &[u16],
    start_id: usize,
    visited: &mut [bool],
    maps1: &[FxHashMap<u16, Vec<usize>>; 3],
    maps2: &[FxHashMap<u16, Vec<usize>>; 3],
) -> Vec<usize> {
    let mut result = Vec::with_capacity(64); // Pre-allocate reasonable capacity
    let mut stack = Vec::with_capacity(64);
    stack.push(start_id);

    while let Some(cuboid_id) = stack.pop() {
        // Use direct indexing - faster than .get() for bool slice
        if visited[cuboid_id] {
            continue;
        }
        visited[cuboid_id] = true;
        result.push(cuboid_id);

        // Get slice for current cuboid once
        let c_start = cuboid_id * OFFSET;
        let c = &cuboids_array[c_start..c_start + OFFSET];

        // Check all 3 axes (0=X, 1=Y, 2=Z)
        for axis in 0..3 {
            let val1 = c[1 + axis];
            let val2 = c[4 + axis];

            // Find cuboids where their val2 equals this cuboid's val1
            if let Some(neighbors) = maps2[axis].get(&val1) {
                for &neighbor_id in neighbors {
                    if !visited[neighbor_id] {
                        let n_start = neighbor_id * OFFSET;
                        let n = &cuboids_array[n_start..n_start + OFFSET];
                        if are_face_adjacent(c, n) {
                            stack.push(neighbor_id);
                        }
                    }
                }
            }

            // Find cuboids where their val1 equals this cuboid's val2
            if let Some(neighbors) = maps1[axis].get(&val2) {
                for &neighbor_id in neighbors {
                    if !visited[neighbor_id] {
                        let n_start = neighbor_id * OFFSET;
                        let n = &cuboids_array[n_start..n_start + OFFSET];
                        if are_face_adjacent(c, n) {
                            stack.push(neighbor_id);
                        }
                    }
                }
            }
        }
    }

    result
}

/// Generate hash maps and find connected cuboid groups from CSV data
///
/// CSV format: id;x1;y1;z1;x2;y2;z2 per line
///
/// Returns CuboidData matching TypeScript type:
/// { groups: Map<number, number[]>, cuboidsArray: Uint16Array }
#[wasm_bindgen(js_name = "groupCuboids")]
pub fn group_cuboids(csv: &str) -> CuboidData {
    let lines: Vec<&str> = csv.trim().lines().collect();
    let count = lines.len();

    // Pre-allocate with exact capacity
    let mut cuboids_array = vec![0u16; count * OFFSET];
    let mut groups: FxHashMap<u32, Vec<u32>> = FxHashMap::default();

    // Use Vec<bool> instead of HashSet - much faster for dense integer IDs
    let mut visited = vec![false; count];

    // Maps for all axes - pre-allocate with reasonable capacity
    let mut maps1: [FxHashMap<u16, Vec<usize>>; 3] = [
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
    ];
    let mut maps2: [FxHashMap<u16, Vec<usize>>; 3] = [
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
        FxHashMap::with_capacity_and_hasher(count / 4, Default::default()),
    ];

    // Parse CSV and populate arrays and maps
    for (i, line) in lines.iter().enumerate() {
        let base = i * OFFSET;
        let mut j = 0;

        // Parse values inline - faster than collecting into Vec first
        for part in line.trim().split(';') {
            if j >= OFFSET {
                break;
            }
            if let Ok(value) = part.parse::<u16>() {
                cuboids_array[base + j] = value;
                j += 1;
            }
        }

        // Populate maps for all 3 axes
        if j >= OFFSET {
            for axis in 0..3 {
                let val1 = cuboids_array[base + 1 + axis];
                let val2 = cuboids_array[base + 4 + axis];

                maps1[axis].entry(val1).or_default().push(i);
                maps2[axis].entry(val2).or_default().push(i);
            }
        }
    }

    // Build groups of connected cuboids
    let mut group_id: u32 = 0;
    for i in 0..count {
        if !visited[i] {
            let connected_cuboids = find_connected(&cuboids_array, i, &mut visited, &maps1, &maps2);

            // Only create groups with more than 1 cuboid
            if connected_cuboids.len() > 1 {
                groups.insert(
                    group_id,
                    connected_cuboids.iter().map(|&x| x as u32).collect(),
                );
                group_id += 1;
            }
        }
    }

    CuboidData {
        cuboids_array,
        groups,
    }
}
