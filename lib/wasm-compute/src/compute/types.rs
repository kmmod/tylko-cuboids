/// Box: [groupId, x, y, z, width, height, depth]
pub type Box3D = [f64; 7];

pub const BOUNDING_BOX_GROUP_ID: f64 = -1.0;

/// Indices for Cuboid array
pub const X1: usize = 1;
pub const Y1: usize = 2;
pub const Z1: usize = 3;
pub const X2: usize = 4;
pub const Y2: usize = 5;
pub const Z2: usize = 6;

/// Cuboid: [id, x1, y1, z1, x2, y2, z2]
pub type Cuboid = [f64; 7];
