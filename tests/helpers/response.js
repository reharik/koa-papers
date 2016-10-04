

module.exports = function response() {

  var statusCode = 200;
  var _headers = {};
  var _data = '';
  var endWasCalled = false;
  
  var getHeader = function (name) {
    return this._headers[name];
  };

  var setHeader = function (name, value) {
    this._headers[name] = value;
  };

  var end = function (data, encoding) {

    if (data) {
      this._data += data;
    }
    if (this._data.length) {
      this.body = this._data;
    }
    this.endWasCalled = true;
  };
   return {
     statusCode,
     _headers,
     _data,
     endWasCalled,
     setHeader,
     getHeader,
     end
   }
};
