import { global, save } from './vars.js';

var rawStrings = {};
var strings = {};

export function loc(key, variables) {
    let string = strings[key];
    if (!string) {
        if (global.settings.expose){
            console.error(`string ${key} not found`);
            console.log(strings);
        }
        return key;
    }
    if (variables) {
        if(variables instanceof Array) {
            for (let i = 0; i < variables.length; i++){
                let re = new RegExp(`%${i}(?!\\d)`, "g");
                if(!re.exec(string)){
                    if (global.settings.expose){
                        console.error(`"%${i}" was not found in the string "${key}" to be replace by "${variables[i]}"`);
                    }
                    continue;
                }
                string = string.replace(re, variables[i]);
            }
            let re = new RegExp("%\\d+(?!\\d)", 'g');
            const results = string.match(re);
            if(results && global.settings.expose){
                console.error(`${results} was found in the string, but there is no variables to make the replacement`);
            }
        }
        else {
            if (global.settings.expose){
                console.error('"variables" need be a instance of "Array"');
            }
        }
    }
    return string;
}

export function getString() {
    let locale = global.settings.locale;
    let defaultString = {};
    try {
        $.ajaxSetup({ async: false });

        if (!rawStrings["en-US"]){
            $.getJSON("strings/strings.json", (data) => { rawStrings["en-US"] = data; });
        }
        Object.assign(defaultString, rawStrings["en-US"]);

        if (locale !== "en-US"){
            let defSize = Object.keys(defaultString).length;
            if (!rawStrings[locale]){
                $.getJSON(`strings/strings.${locale}.json`, (data) => { rawStrings[locale] = data; })
            }
            if (rawStrings[locale]) {
                Object.assign(defaultString, rawStrings[locale]);
            }

            if(Object.keys(defaultString).length !== defSize && global.settings.expose){
                console.error(`string.${locale}.json has extra keys.`);
            }
        }

        let string_pack = save.getItem('string_pack') || false;
        if (string_pack && global.settings.sPackOn){
            let defSize = Object.keys(defaultString).length;
            let themeString = JSON.parse(LZString.decompressFromUTF16(string_pack));
            if (themeString) {
                Object.assign(defaultString, themeString);
            }

            if (Object.keys(defaultString).length !== defSize && global.settings.expose){
                console.error(`string pack has extra keys.`);
            }
        }

        $.ajaxSetup({ async: true });
    }
    catch (e) {
        console.error(e,e.stack);
    }
    strings = defaultString;
}

export const locales = {
    'en-US': 'English (US)',
    'es-ES': 'Spanish (ESP)',
    'pt-BR': 'Português (BR)',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'ko-KR': '한국어',
    'cs-CZ': 'Čeština',
    'ru-RU': 'Русский',
    'im-PL': 'Igpay-Atinlay'
};
