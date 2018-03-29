module.exports = ApiClient = function () {

};

ApiClient.prototype.getJsonAsync = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(xhr.response);
      } else {
        console.log("Status " + status + " fetching: " + url);
      }
    };
    xhr.send();
}