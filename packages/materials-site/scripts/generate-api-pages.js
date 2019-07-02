const readdirp = require('readdirp');
const fs = require('fs');
const path = require('path');

const snakeToCamel = (str) => str.replace(
  /([-_][a-z])/g,
  (group) => group.toUpperCase()
  .replace('-', '')
  .replace('_', '')
);

let settings = {
  type: 'files',
  fileFilter: 'readme.html',
};

var startTime = new Date();
console.log('Generate components API pages started ...');


const componentsBaseDir = `src${path.sep}app${path.sep}demos${path.sep}`


// Iterate recursively through a folder
readdirp('_docs', settings)
  .on('data', (entry) => {
    const baseDirectory = path.dirname(entry.fullPath);
    const componentName = path.basename(baseDirectory);
    const className = snakeToCamel(componentName.charAt(0).toUpperCase() + componentName.slice(1).toLowerCase());

    const componentRoot = `${componentsBaseDir}${componentName}`;
    // Create Component root if not exist
    if (!fs.existsSync(componentRoot)) {
      fs.mkdirSync(componentRoot);
    }

    // Create app-component-tabs page if not exist
    if (!fs.existsSync(`${componentRoot}${path.sep}app-${componentName}-tabs`)) {
      fs.mkdirSync(`${componentRoot}${path.sep}app-${componentName}-tabs`);
      fs.writeFile(
        `${componentRoot}${path.sep}app-${componentName}-tabs${path.sep}app-${componentName}-tabs.tsx`,
        `import { Component, h } from '@stencil/core';
        @Component({
          tag: 'app-${componentName}-tabs',
          styleUrl: 'app-${componentName}-tabs.scss'
        })
        export class App${className}Tabs {

          render() {
            return (
              <app-demo-template-page>
                <app-${componentName}-api slot="api-page"/>
                <app-${componentName}-demo slot="demo-page"/>
              </app-demo-template-page>
            );
          }
        }`,
        (err) => {
          if (err) throw err;
          console.log(`app-${componentName}-tabs.tsx created successfully`);
        }
      );
      fs.writeFile(
        `${componentRoot}${path.sep}app-${componentName}-tabs${path.sep}app-${componentName}-tabs.scss`, '',
        (err) => {
          if (err) throw err;
          console.log(`app-${componentName}-tabs.scss created successfully`);
        }
      );
    }
    // Create app-component-demo page if not exist
    if (!fs.existsSync(`${componentRoot}${path.sep}app-${componentName}-demo`)) {
      fs.mkdirSync(`${componentRoot}${path.sep}app-${componentName}-demo`);
      fs.writeFile(
        `${componentRoot}${path.sep}app-${componentName}-demo${path.sep}app-${componentName}-demo.tsx`,
        `import { Component, h, Host } from '@stencil/core';
        @Component({
          tag: 'app-${componentName}-demo',
          styleUrl: 'app-${componentName}-demo.scss'
        })
        export class App${className}Demo {

          render() {
            return (
              <Host>
                TODO: Add ${componentName} demos
              </Host>
            );
          }
        }`,
        (err) => {
          if (err) throw err;
          console.log(`app-${componentName}-demo.tsx created successfully`);
        }
      );
      fs.writeFile(
        `${componentRoot}${path.sep}app-${componentName}-demo${path.sep}app-${componentName}-demo.scss`, '',
        (err) => {
          if (err) throw err;
          console.log(`app-${componentName}-demo.scss created successfully`);
        }
      );
    }

    // Create app-component-api folder if not exist
    if (!fs.existsSync(`${componentRoot}${path.sep}app-${componentName}-api`)) {
      fs.mkdirSync(`${componentRoot}${path.sep}app-${componentName}-api`);
    }

    // Create app-component-api.tsx from readme.html
    fs.readFile(entry.fullPath, 'utf8', function (err, data) {
      if (err) {
        console.log(err);
      }
      let result = data.replace(/<!-- Auto Generated Below -->/g, '');
      result = result.replace(/<hr>/g, '<hr/>');
      result = result.replace(/{/g, '&#123;');
      result = result.replace(/}/g, '&#125;');
      result = result.replace(/style="color:red"/g, `style={{'color':'red'}}`);
      result = result.replace(/<hr>/g, '<hr/>');
      const page = `
      import { Component, h, Host } from '@stencil/core';


      @Component({
        tag: 'app-${componentName}-api',
      })
      export class ${className}Api {

        /*
        * DO NOT EDIT THIS FILE !!!
        * It has been auto generated from :
        * https://github.com/GMV-centravet/materials/blob/master/src/components/${componentName}/readme.md
        */

        render() {
          return (
            <Host>
            ${result}
            </Host>
          );
        }
      }`;

      fs.writeFile(`${componentRoot}${path.sep}app-${componentName}-api${path.sep}app-${componentName}-api.tsx`, page, 'utf8', function (err) {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`app-${componentName}-api.tsx created successfully`);
      });
    });

    // Add component route to app-root.tsx
    let data = fs.readFileSync(`src${path.sep}app${path.sep}app-root${path.sep}app-root.tsx`, {
      encoding: 'utf8'
    });
    if (!data.includes(`app-${componentName}-tabs`)) {
      data = data.replace(
        '/* ROUTE GENERATION NEEDLE */',
        `{ path: '/components/${componentName}', component: 'app-${componentName}-tabs' },
         { path: '/components/${componentName}/demo', component: 'app-${componentName}-tabs' },
         { path: '/components/${componentName}/api', component: 'app-${componentName}-tabs' },
         /* ROUTE GENERATION NEEDLE */`
      );
    }
    if (!data.includes(`targetUrl="/components/${componentName}"`)) {
      const menuLabel = componentName.charAt(0).toUpperCase() + componentName.slice(1).toLowerCase().replace(/-/g, ' ');
      data = data.replace('{/* MENU GENERATION NEEDLE */}', `<materials-drawer-list-item label="${menuLabel}" targetUrl="/components/${componentName}" />\r\n{/* MENU GENERATION NEEDLE */}`)
    }
    fs.writeFileSync(`src${path.sep}app${path.sep}app-root${path.sep}app-root.tsx`, data, {
      encoding: 'utf8'
    });
    console.log(`${componentName} added to app-root.tsx`);

    // fs.readFile(`src${path.sep}app${path.sep}app-root${path.sep}app-root.tsx`, 'utf8', function (err, data) {
    //   if (err) throw err;
    //   let updatedRoot = data;
    //   if (!updatedRoot.includes(`app-${componentName}-tabs`)) {
    //     updatedRoot = updatedRoot.replace('/* ROUTE GENERATION NEEDLE */', `{ path: '/components/${componentName}', component: 'app-${componentName}-tabs' },\r\n/* ROUTE GENERATION NEEDLE */`)
    //   }
    //   if (!updatedRoot.includes(`targetUrl="/components/${componentName}"`)) {
    //     const menuLabel = snakeToCamel(componentName.charAt(0).toUpperCase() + componentName.slice(1).toLowerCase()).replace('-', ' ');
    //     updatedRoot = updatedRoot.replace('{/* MENU GENERATION NEEDLE */}', `<materials-drawer-list-item label="${menuLabel}" targetUrl="/components/${componentName}" />\r\n{/* MENU GENERATION NEEDLE */}`)
    //   }
    //   fs.writeFile(`src${path.sep}app${path.sep}app-root${path.sep}app-root.tsx`, updatedRoot, 'utf8', function (err) {
    //     if (err) return console.log(err);
    //     console.log(`${componentName} added to app-root.tsx`);
    //   });
    // });
  })
  .on('warn', (warn) => {
    console.log("Warn: ", warn);
  })
  .on('error', (err) => {
    console.log("Error: ", err);
  })
  .on('end', () => {
    console.log(`Building API pages finished in ${(new Date() - startTime) / 1000} s`);
  });
