# ui

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### C compiler

Open `/c` in the app to edit and run the sample C program. It compiles C to
WebAssembly and executes the result in the browser using Wasmer. The compiler
toolchain is downloaded on first use (about 100 MB).

The development server sets the cross-origin isolation headers required by
Wasmer. When deploying the production build, configure the frontend host to
send `Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` as well.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
