use js_sys::Float64Array;
use wasm_bindgen::prelude::*;

use crate::compute::{
    bounding_box::compute,
    build_groups::build_all_groups,
    parse_csv::parse,
    spatial_hash::{build_spatial_hash, SpatialHash},
    types::{Box3D, Cuboid},
};

mod compute;

#[wasm_bindgen]
pub struct BoxesResult {
    data: Vec<f64>,    // flat: [box0, box1, box2, ...]
    offsets: Vec<u32>, // group start indices: [0, 5, 12, ...] (in box count, not f64 count)
}

#[wasm_bindgen]
impl BoxesResult {
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> Float64Array {
        Float64Array::from(&self.data[..])
    }

    #[wasm_bindgen(getter)]
    pub fn offsets(&self) -> Vec<u32> {
        self.offsets.clone()
    }
}

impl From<Vec<Vec<Box3D>>> for BoxesResult {
    fn from(groups: Vec<Vec<Box3D>>) -> Self {
        let total_boxes: usize = groups.iter().map(|g| g.len()).sum();
        let mut data = Vec::with_capacity(total_boxes * 7);
        let mut offsets = Vec::with_capacity(groups.len() + 1);

        offsets.push(0);
        for group in groups {
            for box3d in group {
                data.extend_from_slice(&box3d);
            }
            offsets.push((data.len() / 7) as u32);
        }

        Self { data, offsets }
    }
}

#[wasm_bindgen]
pub struct CuboidProcessor {
    cuboids: Vec<Cuboid>,
    boxes: Vec<Box3D>,
    spatial_hash: SpatialHash,
}

#[wasm_bindgen]
impl CuboidProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> CuboidProcessor {
        CuboidProcessor {
            cuboids: Vec::new(),
            boxes: Vec::new(),
            spatial_hash: SpatialHash::default(),
        }
    }

    pub fn parse_csv(&mut self, csv: &str) -> String {
        match parse(csv) {
            Ok(cuboids) => {
                self.cuboids = cuboids;
                "CSV parsed successfully".to_string()
            }
            Err(err) => err,
        }
    }

    pub fn compute_bounding_box(&self) -> Float64Array {
        let bbox = compute(&self.cuboids);
        Float64Array::from(&bbox[..])
    }

    pub fn build_spatial_hash(&mut self) {
        self.spatial_hash = build_spatial_hash(&self.cuboids);
    }

    pub fn build_groups(&mut self) -> BoxesResult {
        build_all_groups(&self.cuboids, &self.spatial_hash).into()
    }

    pub fn get_cuboid_count(&self) -> usize {
        self.cuboids.len()
    }
}
