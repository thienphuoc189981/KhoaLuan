$(document).ready(function() {
  dataTest(); // khai báo function a ở đây mới bỏ vào  file angularjs được
  // autocompleteKeyWord('txtSearch');
});

function autocompleteKeyWord(idElement) {
    var jsonData = {
        "java": null,
        "Java Developer": "images/autocomplete/samsung.png",
        "iOS Developer": null,
        "PHP Programming Officer": null,
        "Ôtô": null,
        "Ipad": null,
        "Điện thoại": null,
        "Di động": null,
        "Quần áo": null,
        "Mobile": null,
        "Apple": null,
        "Nokia": "images/autocomplete/nokia.jpg",
        "Microsoft": null,
        "Google": null,
        "Máy vi tính": null,
        "HP": null,
        "Dell": null
    }

    $('input#' + idElement).autocomplete({
        data: jsonData
    });
}

function doSearch()
{
  var result = [];
  $('#btnSearch').on('click', function () {
        var kw = $("#txtSearch").val(); 
        var urlCareerlink = 'https://www.careerlink.vn/viec-lam/k/'; //java?keyword_use=A  /ios%2520developer?keyword_use=A
        var urlCareerbuilder = 'http://careerbuilder.vn/viec-lam/';
        var urlMywork = 'https://mywork.com.vn/tim-viec-lam/';//ky-thuat-lap-trinh.html
        var arr1 = careerlink(urlCareerlink,kw);
        var arr2 = mywork( urlMywork , kw)
        var arr3 = careerbuilder(urlCareerbuilder,kw);
        console.log(arr2);
        console.log(result);
        });
    return result;
 
}

function mywork( url , kw)
{
  var rs = [];

    crawlByXMLHttpRequest(url + kw.replace(/ /g, '-')+ '.html', function(hmtlString) {
      var a = url + kw.replace(/ /g, '-')+ '.html';
        htmlParser(hmtlString, 'div.item').each(function(i, jobs) {
          var dt = $(this);
          var datetime, title, city, description, link,company, img, salary;
          city = $('a:last',jobs).text();
          salary = $('span:first',jobs).text() + '-' + $('span:last',jobs).text();
            title = (dt.children().children().eq(0).text()).trim();
            link = 'https://mywork.com.vn' + $('a.title',jobs).attr('href');
            datetime = dt.children().next().next().children().next().children().eq(0).text();
            description = $('small',jobs).text();
            var des = '...'+description.split('...')[1]+'...';
            company =(dt.children().next().next().children().children().children().next().eq(0).text()).trim();
            if (!$('img', jobs).attr('src')) {
                img = "images/no-img.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
        "datetime" : "datetime",
          "title" : "title", 
          "location" : "city", 
          "description" : "", 
          "link" : "link",
          "company" : "company",
          "image" : "img",
          "salary" : "salary"
      };
      rs.push(json);
      
        });
    });
    return rs;
}

function careerbuilder( url , kw)
{
    var rs = [];

    crawlByXMLHttpRequest(url + kw.replace(/ /g, '-')+ '-k-vi.html', function(hmtlString) {
        htmlParser(hmtlString, 'dd.brief').each(function(i, jobs) {
            var datetime, title, city, description, link, company;
            city = $('span.location',jobs).text();
            title = $('a.job',jobs).text();
            link = $('a.job',jobs).attr('href');
            datetime = $('p.dateposted',jobs).text();
            description = $('p.rc_jobDescription',jobs).text();
            company = $('span.location',jobs).text();
            if (!$('img', jobs).attr('src')) {
                img = "images/no-img.png";
            } else {
                img = 'http://careerbuilder.vn'+$('img', jobs).attr('src');
            }
            var date = datetime.split("Dăng tuyển: ");
            var json = {
        datetime : datetime,
          title : title, 
          location : city, 
          description : description, 
          link : link,
          company : company,
          image : img,
          salary : 'select to view'
      };
      rs.push(json);

        })

    })
    return rs;
}

function careerlink( url , kw)
{
  var rs = [];

    crawlByXMLHttpRequest(url + kw.replace(/ /g, '%2520')+ '?keyword_use=A', function(hmtlString) {
      var a = url + kw.replace(/ /g, '-')+ '?keyword_use=A';
      //console.log(hmtlString);
      alert(a);
        htmlParser(hmtlString, 'div.list-group-item').each(function(i, jobs) {
          var datetime, title, city, description, link,company, img, salary;
          city = $('a:last',jobs).text();
          salary = (($('small:first',jobs).text()).split('|')[0]).trim();
            title = $('a:first',jobs).text();
            link = 'https://www.careerlink.vn' + $('a:first',jobs).attr('href');
            datetime = $('small:last',jobs).text();
            description = $('small',jobs).text();
            var des = '...'+description.split('...')[1]+'...';
            company = $('a.text-accent',jobs).text();
            if (!$('img', jobs).attr('src')) {
                img = "images/no-img.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
        datetime : datetime,
          title : title, 
          location : city, 
          description : des, 
          link : link,
          company : company,
          image : img,
          salary : salary
      };
      rs.push(json);
        })
       // console.log(rs);
    })
    return rs;
}

function crawlByXMLHttpRequest(url, fn) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fn(this.responseText);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

function htmlParser(htmlString, classElement) {
    // jquery
    var $element = $('<div></div>');
    $element.html(htmlString);
    var DOM = $(classElement, $element);
    return DOM;
}

function dataTest()
{
  var a = [
  {
   datetime : "datetime",
   title: "iOS Developer",
   location: "Ho Chi Minh",
   district: "Tan Binh",
   description: "The iOS developer position will be required to have experience on iOS and eager to learn and work on new mobile platform.",
   link: "iOS Objective C Mobile Apps",
   company : "company",
         image : "img",
          salary : "salary"
  },
  {
   datetime : "datetime",
   title: "Business Analyst",
   location: "Ho Chi Minh",
   district: "Binh Thanh",
   description: "About Alternative Investments Operations (AIO) As part of the Alternative Investments team, your greatest assets are your teammates. Our platform...",
   link: "Business Analyst Sales Engineer English",
   company : "company",
          image : "img",
          salary : "salary"
  },
  {
   datetime: "datetime",
   title: "Web Developer - URGENT!! ($500-$1000)",
   location: "Ha Noi",
   district: "Cau Giay",
   description: "Đọc tài liệu yêu cầu từ khách hàng để tham gia xây dựng hệ thống cùng nhóm phát triển Lựa chọn...",
   link: "Java PHP NodeJS",
   company : "company",
          image : "img",
          salary : "salary"
  },
  {
   datetime : "datetime",
   title: "Senior PHP Developer",
   location: "Ho Chi Minh",
   district: "District 1",
   description: "Work as the front-end developer in development of OTTtv project and advertising technology platform Be responsible for developing, enhancing,...",
   link: "PHP Linux MySQL",
   company : "company",
          image : "img",
          salary : "salary"
  }
 ];
 return a;
}