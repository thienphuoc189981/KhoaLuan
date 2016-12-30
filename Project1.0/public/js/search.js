$(document).ready(function() {

  //----------- khai bao collapse----------
  $('.collapse').on('shown.bs.collapse', function(){
  $(this).parent().find(".glyphicon-plus").removeClass("glyphicon-plus").addClass("glyphicon-minus");
  }).on('hidden.bs.collapse', function(){
  $(this).parent().find(".glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
    });
    autocompleteKeyWord();
});
function autocompleteKeyWord() {
    var availableTags = [
        "Lập trình java",
        "Japanese Language Teacher",
        "Kế toán",
        "Kế toán văn phòng",
        "Nhân viên kiểm toán",
        "Nhân viên bán hàng",
        "Tiếp thị",
        "AppleScript",
        "Asp",
        "BASIC",
        "C",
        "C++",
        "Clojure",
        "COBOL",
        "ColdFusion",
        "Erlang",
        "Fortran",
        "Groovy",
        "Haskell",
        "JavaScript",
        "Lisp",
        "Perl",
        "Lập trình PHP",
        "Python",
        "Ruby",
        "Scala",
        "Scheme"
    ];
    $("#txtSearch").autocomplete({
        source: availableTags
    });
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};