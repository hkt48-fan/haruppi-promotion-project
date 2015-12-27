import configs from './configs';
import fs from 'fs';
import path from 'path';


class ConfigManager{
    constructor(){
        this.configs = configs;
    }

    save(){
        var configPath = path.join(__dirname, './configs.json')
        // console.log(this.configs);
        fs.writeFileSync(configPath, JSON.stringify(this.configs, null, 4));
    }
}

export default new ConfigManager();