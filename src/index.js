import StyleDictionary from "style-dictionary-utils";
import { w3cTokenJson5Parser } from "style-dictionary-utils/dist/parser/w3c-token-json5-parser.js"
import JSON5 from 'json5';
StyleDictionary.registerParser(w3cTokenJson5Parser)

// StyleDictionary.registerTransform({
//   name: 'attribute/arrayToProperties',
//   type: 'attribute',
//   transformer: function(prop) {
//     // console.log(prop)
//     if (Array.isArray(prop.value)) {
//       return prop.value.map((item, index) => ({
//         // name: `${prop.name}-${index + 1}`,
//         name: item,
//         value: item
//       }));
//     }
//     return prop;
//   }
// });
StyleDictionary.registerFormat({
  name: 'css/customFormat',
  formatter: function(dictionary, config) {
    // console.log(dictionary.allProperties)
    const customProperties = dictionary.allProperties.map(prop => {
      // console.log(prop);
      if (Array.isArray(prop.value)) {
        return prop.value.map((item, index) => {
          // console.log(typeof(item));
          const words = item.split(' ');
          words.shift();
          const result = words.join(' ');
          return `--${prop.name}${result}: ${item};`;
        }).join('\n');
      } else {
        return `--${prop.name}: ${prop.value};`;
      }
    }).join('\n');

    return `:root {\n${customProperties}\n}`;
  }
});
StyleDictionary.registerTransformGroup({
  name: 'cssCamel',
  transforms: [ 'name/cti/camel']
});



// Utility function to convert a string to camelCase with specific rules
function toCamelCase(str) {
  return str.replace(/-./g, match => match.charAt(1).toUpperCase());
}

// Utility function to handle special capitalization rules
function capitalizeSpecialCases(segment) {
  return segment.replace(/point/g, 'Point');
}

// Register a custom transform to handle renaming and array values
StyleDictionary.registerTransform({
  name: 'name/cti/custom',
  type: 'name',
  transformer: function(prop) {
    // Custom logic to remove "default" from the token name and convert to camelCase
    // console.log(prop);
    const path = prop.path.map(segment => segment === 'default' ? '' : segment);
    const filteredPath = path.filter(Boolean).map(capitalizeSpecialCases);
    const camelCaseName = filteredPath.join('-').replace(/-./g, match => match.charAt(1).toUpperCase());
    return toCamelCase(camelCaseName);
  }
});


// Register a custom transform group
StyleDictionary.registerTransformGroup({
  name: 'defaultEliminatorCamel',
  transforms: ['name/cti/custom']
});


const typographyTokenType=["fontFamily","lineHeight","letterSpacing","fontSize","fontWeight"]
const typographyTransformGroups=['cssCamel',"defaultEliminatorCamel","defaultEliminatorCamel",'cssCamel','cssCamel','cssCamel']
const typographyFormat=["css/customFormat","css/variables","css/variables","css/variables","css/variables"]



for(let i=0;i<5;i++){
    const config = {
      source: [`tokens/primitive/typography/${typographyTokenType[i]}*.tokens.json5`],
      platforms: {
        css: {
          buildPath: `dist/css/primitive/typography/`,
          transformGroup:typographyTransformGroups[i],
          "files": [
            {
              "destination": `${typographyTokenType[i]}.css`,
              "format": `${typographyFormat[i]}`
            }
          ]
        },
      },
    };
    
    const sd = StyleDictionary.extend(config);
    sd.buildAllPlatforms();
}