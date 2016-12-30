$(document).ready(function() {
    dataTest(); 
    //-------------------

  //----------- khai bao collapse----------
  $('.collapse').on('shown.bs.collapse', function(){
  $(this).parent().find(".glyphicon-plus").removeClass("glyphicon-plus").addClass("glyphicon-minus");
  }).on('hidden.bs.collapse', function(){
  $(this).parent().find(".glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
    });
   // autocompleteKeyWord();
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

function dataTest()
{
  var a = [
  {
   postDate : "23/9/2016",
   source : 'careerlink.vn',
   title: "iOS Developer",
   location: "Ho Chi Minh",
   district: "Tan Binh",
   description: "The iOS developer position will be required to have experience on iOS and eager to learn and work on new mobile platform.",
   link: "iOS Objective C Mobile Apps",
   company : "company",
         image : "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png",
          salary : "salary"
  },
  {
   postDate : "23/9/2016",
   source : 'careerlink.vn',
   title: "Business Analyst",
   location: "Ho Chi Minh",
   district: "Binh Thanh",
   description: "About Alternative Investments Operations (AIO) As part of the Alternative Investments team, your greatest assets are your teammates. Our platform...",
   link: "Business Analyst Sales Engineer English",
   company : "company",
          image : "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png",
          salary : "salary"
  },
  {
   postDate : "23/9/2016",
   source : 'careerlink.vn',
   title: "Web Developer - URGENT!! ($500-$1000)",
   location: "Ha Noi",
   district: "Cau Giay",
   description: "Đọc tài liệu yêu cầu từ khách hàng để tham gia xây dựng hệ thống cùng nhóm phát triển Lựa chọn...",
   link: "Java PHP NodeJS",
   company : "company",
          image : "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png",
          salary : "salary"
  },
  {
   postDate : "23/9/2016",
   source : 'careerlink.vn',
   title: "Senior PHP Developer",
   location: "Ho Chi Minh",
   district: "District 1",
   description: "Work as the front-end developer in development of OTTtv project and advertising technology platform Be responsible for developing, enhancing,...",
   link: "PHP Linux MySQL",
   company : "company",
          image : "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png",
          salary : "salary"
  }
 ];
 return a;
}