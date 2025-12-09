# Wasm-comput for Tylko Cuboids

This directory contains a WebAssembly module used for computing cuboid groupings based on face adjacency. The module is written in Rust and compiled to WebAssembly for performance.

## Prerequisites

- Rust
- wasm-pack
- cargo make


## List cargo make tasks:

```
cargo make help-wasm
```


Build:

```bash
cargo make build-web
```

Build dev in watch mode (hot reloads web app on changes to Rust code):

```bash
cargo make build-web-watch
```
