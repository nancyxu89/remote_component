# my-editor

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

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```


### async remote component

######1 product remoted component: set webpack config, whick makes .vue file into *.js;


######2 axios.get the remote *.js, change it through new Function
```
  axios
       .get("http://192.168.206.150:13001/static/components/a.js")
       .then(res => {
         console.log(res);
         let Fn = Function;
         this.mode = new Fn(`return ${res.data}`)();
         console.log(this.mode);
       });
```

######3 the using page need do like this
```
       <component
                     :is="mode"
                     v-bind="$attrs"
                     v-on="$listeners">
             </component>


```