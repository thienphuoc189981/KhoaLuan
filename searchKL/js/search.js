$(document).ready(function() {
  dataTest(); 

  //----------- khai bao collapse----------

  $('.collapse').on('shown.bs.collapse', function(){
  $(this).parent().find(".glyphicon-plus").removeClass("glyphicon-plus").addClass("glyphicon-minus");
  }).on('hidden.bs.collapse', function(){
  $(this).parent().find(".glyphicon-minus").removeClass("glyphicon-minus").addClass("glyphicon-plus");
  });
});

function getcareerbuilder(url,kw,callback)
{
    var rs = [];

   AcrawlByXMLHttpRequest(url + kw.replace(/ /g, '-')+ '-k-vi.html', function(hmtlString) {
        AhtmlParser(hmtlString, 'dd.brief').each(function(i, jobs) {
            var dt = $(this);
            var dateposted, title, city, description, link, company,id,salary;
            id = guid();
            city = $('p.location',jobs).text();
            var sl = $('p.salary',jobs).text();
            salary = sl.split('Lương:')[1].replace(/Tr/g,'triệu').replace(/VND/g,'');
            title = $('h3.job',jobs).text();
            link = dt.children().next().eq(0).children().children().attr('href');
            dateposted = $('div.dateposted',jobs).text().split("Đăng tuyển:")[1].trim();
            description = $('p.rc_jobDescription',jobs).text().replace('"','');
            var drr = description.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ");
            company = dt.children().children().next().eq(0).children().text();
            if (!$('img', jobs).attr('data-original')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = $('img', jobs).attr('data-original');
            }
            var json = {
                _id: id,
                postDate : dateposted,
                expireDate: "",
                title : title, 
                location : city, 
                description : "", 
                link : link,
                company : company,
                image : img,
                salary : salary,
                source : 'careerbuilder.vn'
            };
            if(i < 32)
            {
              rs.push(json);
            }
        })
        callback(rs);
    });

    var urlMywork = 'https://mywork.com.vn/tim-viec-lam/';

    AcrawlByXMLHttpRequest(urlMywork + kw.replace(/ /g, '-')+ '.html', function(hmtlString) {
        var a = url + kw.replace(/ /g, '-')+ '.html';
        AhtmlParser(hmtlString, 'div.item').each(function(i, jobs) {
            var dt = $(this);
            var expireDate, title, city, description, link,company, img, salary, id;
            id = guid();
            city = $('a:last',jobs).text();
            salary = dt.children().next().eq(0).text().trim();
            title = (dt.children().children().eq(0).text()).trim();
            link = 'https://mywork.com.vn' + $('a.title',jobs).attr('href');
            expireDate = dt.children().next().next().children().next().children().eq(0).text();
            description = $('small',jobs).text().replace('"','');
            var des = '...'+description.split('...')[1]+'...';
            company =(dt.children().next().next().children().children().children().next().eq(0).text()).trim();
            if (!$('img', jobs).attr('src')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
                "_id":id,    
                postDate : "",
                "expireDate" : expireDate,
                "title" : title, 
                "location" : city, 
                "description" : "Nhấn vào đề xem chi tiết công việc", 
                "link" : link,
                "company" : company,
                "image" : img,
                "salary" : salary,
                "source" : 'mywork.com.vn'
            };
            rs.push(json);           
        });
        callback(rs);
    });
    
    var urlCareerlink = 'https://www.careerlink.vn/viec-lam/k/';

    AcrawlByXMLHttpRequest(urlCareerlink + kw.replace(/ /g, '%2520')+ '?keyword_use=A', function(hmtlString) {
        var a = url + kw.replace(/ /g, '-')+ '?keyword_use=A';
        AhtmlParser(hmtlString, 'div.list-group-item').each(function(i, jobs) {
            var postDate, title, city, description, link,company, img, salary, id;
            id = guid();
            var dt = $(this);
            var location = $('p.priority-data',jobs).text();
            city = location.split('-')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ");

            salary = (($('small:first',jobs).text()).split('|')[0]).trim();
            var trimSalary = salary.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ") ;
            if(trimSalary.indexOf('VNĐ') > -1 && trimSalary.indexOf(',') > -1 && trimSalary.indexOf('-') > -1){
              console.log("sa "+ trimSalary);
              trimSalary = trimSalary.replace(/,/g,"").replace(/VNĐ/g,"").split('-');
              var min = parseFloat(trimSalary[0].trim()) / 1000000 ;
              var max = parseFloat(trimSalary[1].trim()) / 1000000 ;
              trimSalary = min + ' triệu - ' + max + ' triệu ';
            }

            title = $('a:first',jobs).text();
            link = 'https://www.careerlink.vn' + $('a:first',jobs).attr('href');
            postDate = dt.children().next().children().next().eq(3).children().text().trim();
            var description = dt.children().next().children().next().eq(0).children().children().next().children().text().replace('"','');
            var drr = description.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ");
            company = $('a.text-accent',jobs).text();
            if (!$('img', jobs).attr('src')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
                _id: id,
                postDate : postDate,
                expireDate : "",
                title : title, 
                location : city, 
                description : drr, 
                link : link,
                company : company,
                image : img,
                salary : trimSalary,
                source : 'careerlink.vn'
            };
            rs.push(json);
        });
       callback(rs);
    });
    
};

function AcrawlByXMLHttpRequest(url, fn) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            fn(this.responseText);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
};

function AhtmlParser(htmlString, classElement) {
    // jquery
    var $element = $('<div></div>');
    $element.html(htmlString);
    var DOM = $(classElement, $element);
    return DOM;
};

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