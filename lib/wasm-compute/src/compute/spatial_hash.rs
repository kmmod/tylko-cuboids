use crate::compute::types::{Cuboid, X1, X2, Y1, Y2, Z1, Z2};
// Apparently FxHashMap is a lot faster than the standard HashMap for this use case (about 10x times)
// The hash map in std uses SipHash by default, which provides resistance against DOS attacks, but is slow.
use rustc_hash::FxHashMap;

const CELL_SIZE: f64 = 800.0;

pub type SpatialHash = FxHashMap<(i32, i32, i32), Vec<usize>>;

pub fn build_spatial_hash(cuboids: &[Cuboid]) -> SpatialHash {
    let mut hash = SpatialHash::default();

    for (i, c) in cuboids.iter().enumerate() {
        let min_cx = (c[X1] / CELL_SIZE).floor() as i32;
        let min_cy = (c[Y1] / CELL_SIZE).floor() as i32;
        let min_cz = (c[Z1] / CELL_SIZE).floor() as i32;
        let max_cx = ((c[X2] - 1.0) / CELL_SIZE).floor() as i32;
        let max_cy = ((c[Y2] - 1.0) / CELL_SIZE).floor() as i32;
        let max_cz = ((c[Z2] - 1.0) / CELL_SIZE).floor() as i32;

        for cx in min_cx..=max_cx {
            for cy in min_cy..=max_cy {
                for cz in min_cz..=max_cz {
                    hash.entry((cx, cy, cz)).or_default().push(i);
                }
            }
        }
    }

    hash
}
