use crate::compute::spatial_hash::SpatialHash;
use crate::compute::types::{Box3D, Cuboid, X1, X2, Y1, Y2, Z1, Z2};
use rustc_hash::FxHashMap;

pub fn build_all_groups(cuboids: &[Cuboid], spatial_hash: &SpatialHash) -> Vec<Vec<Box3D>> {
    let n = cuboids.len();
    if n == 0 {
        return Vec::new();
    }

    let mut uf = UnionFind::new(n);

    // Build unions
    for indices in spatial_hash.values() {
        for i in 0..indices.len() {
            for j in (i + 1)..indices.len() {
                let a = indices[i];
                let b = indices[j];
                if are_face_adjacent(&cuboids[a], &cuboids[b]) {
                    uf.union(a, b);
                }
            }
        }
    }

    // Collect groups
    let mut group_map: FxHashMap<usize, Vec<usize>> = FxHashMap::default();
    for i in 0..n {
        group_map.entry(uf.find(i)).or_default().push(i);
    }

    // Build grouped boxes
    group_map
        .into_values()
        .filter(|indices| indices.len() >= 2)
        .enumerate()
        .map(|(group_id, indices)| {
            indices
                .iter()
                .map(|&idx| {
                    let c = &cuboids[idx];
                    let w = c[X2] - c[X1];
                    let h = c[Y2] - c[Y1];
                    let d = c[Z2] - c[Z1];
                    [
                        group_id as f64,
                        c[X1] + w / 2.0,
                        c[Y1] + h / 2.0,
                        c[Z1] + d / 2.0,
                        w,
                        h,
                        d,
                    ]
                })
                .collect()
        })
        .collect()
}

#[inline]
fn are_face_adjacent(a: &Cuboid, b: &Cuboid) -> bool {
    // X-face
    if (a[X2] == b[X1] || b[X2] == a[X1])
        && a[Y2] > b[Y1]
        && b[Y2] > a[Y1]
        && a[Z2] > b[Z1]
        && b[Z2] > a[Z1]
    {
        return true;
    }
    // Y-face
    if (a[Y2] == b[Y1] || b[Y2] == a[Y1])
        && a[X2] > b[X1]
        && b[X2] > a[X1]
        && a[Z2] > b[Z1]
        && b[Z2] > a[Z1]
    {
        return true;
    }
    // Z-face
    if (a[Z2] == b[Z1] || b[Z2] == a[Z1])
        && a[X2] > b[X1]
        && b[X2] > a[X1]
        && a[Y2] > b[Y1]
        && b[Y2] > a[Y1]
    {
        return true;
    }
    false
}

// Union-Find with path compression and union by rank
pub struct UnionFind {
    parent: Vec<usize>,
    rank: Vec<u8>,
}

impl UnionFind {
    pub fn new(n: usize) -> Self {
        Self {
            parent: (0..n).collect(),
            rank: vec![0; n],
        }
    }

    pub fn find(&mut self, x: usize) -> usize {
        if self.parent[x] != x {
            self.parent[x] = self.find(self.parent[x]);
        }
        self.parent[x]
    }

    pub fn union(&mut self, x: usize, y: usize) {
        let px = self.find(x);
        let py = self.find(y);
        if px == py {
            return;
        }

        match self.rank[px].cmp(&self.rank[py]) {
            std::cmp::Ordering::Less => self.parent[px] = py,
            std::cmp::Ordering::Greater => self.parent[py] = px,
            std::cmp::Ordering::Equal => {
                self.parent[py] = px;
                self.rank[px] += 1;
            }
        }
    }
}
