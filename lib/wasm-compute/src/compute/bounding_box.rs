use crate::compute::types::{Box3D, Cuboid, BOUNDING_BOX_GROUP_ID, X1, X2, Y1, Y2, Z1, Z2};

pub fn compute(cuboids: &[Cuboid]) -> Box3D {
    if cuboids.is_empty() {
        return [BOUNDING_BOX_GROUP_ID, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    }

    let (min, max) = cuboids
        .iter()
        .fold(([f64::MAX; 3], [f64::MIN; 3]), |(min, max), c| {
            (
                [min[0].min(c[X1]), min[1].min(c[Y1]), min[2].min(c[Z1])],
                [max[0].max(c[X2]), max[1].max(c[Y2]), max[2].max(c[Z2])],
            )
        });

    [
        BOUNDING_BOX_GROUP_ID,
        (min[0] + max[0]) / 2.0,
        (min[1] + max[1]) / 2.0,
        (min[2] + max[2]) / 2.0,
        max[0] - min[0],
        max[1] - min[1],
        max[2] - min[2],
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_cuboid() {
        let cuboids = vec![[0.0, 0.0, 0.0, 0.0, 10.0, 20.0, 30.0]];
        let result = compute(&cuboids);
        assert_eq!(result, [-1.0, 5.0, 10.0, 15.0, 10.0, 20.0, 30.0]);
    }

    #[test]
    fn test_multiple_cuboids() {
        let cuboids = vec![
            [0.0, 0.0, 0.0, 0.0, 5.0, 5.0, 5.0],
            [1.0, 10.0, 10.0, 10.0, 20.0, 20.0, 20.0],
        ];
        let result = compute(&cuboids);
        assert_eq!(result, [-1.0, 10.0, 10.0, 10.0, 20.0, 20.0, 20.0]);
    }

    #[test]
    fn test_empty() {
        let cuboids: Vec<Cuboid> = vec![];
        let result = compute(&cuboids);
        assert_eq!(result[0], -1.0);
    }
}
