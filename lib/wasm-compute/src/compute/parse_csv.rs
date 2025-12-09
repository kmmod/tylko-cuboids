use crate::Cuboid;

/// Parse CSV string into vector of cuboids
/// Format: id;x1;y1;z1;x2;y2;z2
pub fn parse(csv: &str) -> Result<Vec<Cuboid>, String> {
    csv.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .enumerate()
        .map(|(i, line)| parse_line(i + 1, line))
        .collect()
}

fn parse_line(line_num: usize, line: &str) -> Result<Cuboid, String> {
    let parts: Vec<f64> = line
        .split(';')
        .map(|s| s.parse())
        .collect::<Result<_, _>>()
        .map_err(|_| format!("Invalid number in line {line_num}: {line}"))?;

    parts
        .try_into()
        .map_err(|v: Vec<_>| format!("Line {line_num}: expected 7 values, got {}", v.len()))
}
