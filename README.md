# Tylko Cuboids

A WebGL 2 visualization of cuboid groups defined in CSV files. Built with Vite 7, TypeScript, and Three.js.

## Prerequisites

- Node.js 22+
- pnpm 9+

## Setup & Run Instructions

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tylko-cuboids

# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
pnpm build

# Preview the production build
pnpm preview
```

### Usage

1. Open the application in your browser
2. Drag and drop a CSV file onto the viewport, or use the file input button
3. The cuboids will be grouped by face adjacency and rendered with distinct materials
4. Use mouse controls to navigate:
   - **Left click + drag**: Orbit camera
   - **Right click + drag**: Pan camera
   - **Scroll wheel**: Zoom in/out

---

## CSV File Format

The input CSV file should follow this structure:

```csv
id,x1,y1,z1,x2,y2,z2
1,0,0,0,2,3,4
2,2,3,0,5,5,4
3,10,10,10,15,15,15
```

Where:
- `id` – Unique identifier for the cuboid
- `(x1, y1, z1)` – Start point of the diagonal
- `(x2, y2, z2)` – End point of the diagonal

---

## Grouping Algorithm

*TODO: Document the adjacency grouping algorithm*

## Architecture

*TODO: Document the overall architecture and code structure*

## WebGL 2 Justification

*TODO: Explain the choice of WebGL 2 over WebGPU*

## Performance & Optimizations

*TODO: Document performance considerations and optimizations for 500k cuboids*

## Limitations

*TODO: Document any known limitations*
