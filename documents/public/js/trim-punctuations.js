function trimText (str) {
  var e = document.createElement('span');
  e.className = 'right';
  e.appendChild(document.createTextNode(str));
  return e;
}

function parse (elem) {
  for (var i = elem.childNodes.length; i --;) {
    console.log('parse:', i);
    var childNode = elem.childNodes[i];
    if (childNode.nodeType != 3)
      continue;

    var source = childNode.nodeValue;
    var trimPositions = findTrimPositions(source);

    if (trimPositions.length == 0)
      continue;

    var fragment = document.createDocumentFragment();
    var lastOne = trimPositions[0];
    if (lastOne)
      fragment.appendChild(document.createTextNode(source.substr(0, lastOne)));
    for (var j = 0; j < trimPositions.length; j ++) {
      var thisOne = trimPositions[j];
      if (thisOne - lastOne > 1)
        fragment.appendChild(document.createTextNode(source.substr(lastOne + 1, thisOne - lastOne - 1)));
      fragment.appendChild(trimText(source[thisOne]));
      lastOne = thisOne;
    }

    if (source.length - lastOne > 1)
      fragment.appendChild(document.createTextNode(source.substr(lastOne + 1)));

    elem.replaceChild(fragment, childNode);
  }
}

function findTrimPositions (source) {
  var punctuations = {
    open: '「『《（［｛〔【。？！，、；：',
    closing: '」』》）］｝〕】',
    idsp: '\u3000'
  };

  var combination = [
    ["open"   , "open"],
    ["closing", "closing"],
    ["closing", "open"],
    ["idsp"   , "open"],
    ["closing", "idsp"]
  ];
  function isIn (char, where) {
    return punctuations[where].indexOf(char) != -1;
  }

  var result = [];

  for (var i = 1; i < source.length; i ++) {
    for (var j = 0; j < combination.length; j ++) {
      var first = combination[j][0];
      var second = combination[j][1];
      if (isIn(source[i], second) && isIn(source[i - 1], first)) {
        result.push(i - 1);
        break;
      }
    }
  }

  return result;
}
