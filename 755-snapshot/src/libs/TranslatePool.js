class TranslatePool{
  constructor(trans){
    this.trans = trans;
  }

  setTranslateList(trans){
    this.trans = trans;
  }

  getTranslateText(originalText){
    let translateObj= this.trans.find(t=>t.text === originalText);
    if (!translateObj) {
      return '?????';
      // throw new Error('failed find matched translate entity.', originalText)
    }

    return translateObj.trans;
  }
}

export default new TranslatePool();