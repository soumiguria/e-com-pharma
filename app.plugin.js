const { withAppBuildGradle, withProjectBuildGradle } = require('@expo/config-plugins');

function withFixDuplicateClasses(config) {
  // Modify project-level build.gradle
  config = withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Add configuration to exclude old support libraries at project level
    const excludeConfig = `
allprojects {
    configurations.all {
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'versionedparcelable'
        exclude group: 'com.android.support', module: 'localbroadcastmanager'
    }
}
`;
    
    // Insert before the buildscript or allprojects block
    if (buildGradle.includes('allprojects {')) {
      config.modResults.contents = buildGradle.replace(
        /(allprojects\s*\{)/,
        `$1\n    configurations.all {\n        exclude group: 'com.android.support', module: 'support-compat'\n        exclude group: 'com.android.support', module: 'versionedparcelable'\n        exclude group: 'com.android.support', module: 'localbroadcastmanager'\n    }`
      );
    } else if (buildGradle.includes('buildscript {')) {
      config.modResults.contents = buildGradle.replace(
        /(buildscript\s*\{)/,
        `${excludeConfig}\n$1`
      );
    }
    
    return config;
  });
  
  // Modify app-level build.gradle
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Add to android block
    if (buildGradle.includes('android {')) {
      const androidBlock = buildGradle.match(/android\s*\{[^}]*\}/s);
      if (androidBlock && !androidBlock[0].includes('configurations.all')) {
        config.modResults.contents = buildGradle.replace(
          /(android\s*\{)/,
          `$1\n    configurations.all {\n        exclude group: 'com.android.support', module: 'support-compat'\n        exclude group: 'com.android.support', module: 'versionedparcelable'\n        exclude group: 'com.android.support', module: 'localbroadcastmanager'\n    }`
        );
      }
    }
    
    return config;
  });
}

module.exports = withFixDuplicateClasses;
