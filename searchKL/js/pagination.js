var app = angular.module('myApp', ['ui.bootstrap']);

app.factory('Items', ['$http', function ($http) {
        return {
            checkCached : function(q) {
                return $http.get('http://localhost:1337/api/checkCached?q='+ q);
            },
            dbSearch : function(q) {
                return $http.get('http://localhost:1337/api/dbSearch?q='+ q);
            },
            indexVnTokenizer : function(json) {
                return $http.post('http://localhost:1337/api/vnTokenizer', json);
            },
            solrSearch : function(json,q) {
                return $http.post('http://localhost:1337/api/solrSearch?q='+q, json);
            }
        }
}]);

app.controller('PageCtrl',['Items','$scope', function (Items,$scope) {   

    $scope.items = dataTest();   
    $scope.todos = "cddddd";
    $scope.doSearch = function() {

        Items.checkCached($scope.formData.txtSearch)
            .success(function(data) {
              
                //$scope.todos = $scope.todos.status;
                if (data.status) {
                    var json = [];
                    for (var i = 0; i <data.rows.length; i++){
                        json.push(data.rows[i].doc);
                    };
                    $scope.todos = json;
                    console.log(json);
                    console.log("status true");
                    $scope.items = json;
                    $scope.totalItems = json.length;
                    console.log(json.length)
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                    end = begin + $scope.entryLimit;
                    $scope.filtereditems = $scope.items.slice(begin, end);
                    //$scope.$digest();
                }else{


                    $scope.urlCareerbuilder = 'http://careerbuilder.vn/viec-lam/';
                    getcareerbuilder($scope.urlCareerbuilder,$scope.formData.txtSearch,function(rs){ 
                        var s =JSON.stringify(rs).replace(/\\n/g, "");
                        s=s.replace(/\\t/g, "");
                      
                        rs = JSON.parse(s);
                          // console.log(rs);
                    //xu ly search
                     var json = [];
                    Items.dbSearch($scope.formData.txtSearch)
                        .success(function(data) {
                            for (var i = 0; i <data.rows.length; i++){
                                json.push(data.rows[i].doc);
                            };

                            $scope.todos = json;
                            console.log(json);

                            for (var i = 0; i <rs.length; i++){
                                    json.push(rs[i]);
                                };   


                                // call the create function from our service (returns a promise object)
                            Items.indexVnTokenizer(json)
                                .success(function(data) {

                                    // console.log(data);
                                    var a = JSON.parse(data);
                                    // console.log("this is a: "+a);

                                     Items.solrSearch(a,$scope.formData.txtSearch)
                                        .success(function(result) {
                                            // result.push({"q" : $scope.formData.txtSearch})
                                            console.log("this is solr " +result);
                                            result = JSON.stringify(result);
                                            console.log("this is solr " +result);
                                            result = JSON.parse(result);
                                            console.log(result);

                                            $scope.items = result;
                                            $scope.totalItems = result.length;
                                            console.log(result.length)
                                            $scope.pageCount = function () {
                                                return Math.ceil($scope.totalItems / $scope.entryLimit);
                                            };
                                            var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                                            end = begin + $scope.entryLimit;
                                            $scope.filtereditems = $scope.items.slice(begin, end);
                                            //$scope.$digest();

                                    });
                                });


                        });

                    $scope.items = rs;
                    $scope.totalItems = $scope.items.length;
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                    end = begin + $scope.entryLimit;
                    $scope.filtereditems = $scope.items.slice(begin, end);
                    $scope.$digest();
                  });

                }
            });

      /*  $scope.urlCareerbuilder = 'http://careerbuilder.vn/viec-lam/';
         getcareerbuilder($scope.urlCareerbuilder,$scope.formData.txtSearch,function(rs){ 
            //xu ly search
            console.log(rs);
            $scope.items = rs;
            $scope.totalItems = $scope.items.length;
            $scope.pageCount = function () {
                return Math.ceil($scope.totalItems / $scope.entryLimit);
            };
            var begin = (($scope.currentPage - 1) * $scope.entryLimit),
            end = begin + $scope.entryLimit;
            $scope.filtereditems = $scope.items.slice(begin, end);
            $scope.$digest();
          });*/

    };
                    $scope.currentPage = 1;
                    $scope.totalItems = $scope.items.length;
                    $scope.entryLimit = 8; // items per page
                    $scope.noOfPages = Math.ceil($scope.totalItems / $scope.entryLimit);
                    $scope.maxSize = 3;
            
                    $scope.pageCount = function () {
                        return Math.ceil($scope.totalItems / $scope.entryLimit);
                    };
                    // $watch search to update pagination
                    $scope.$watch('currentPage + itemsPerPage', function () {
                        var begin = (($scope.currentPage - 1) * $scope.entryLimit),
                            end = begin + $scope.entryLimit;
                
                        $scope.filtereditems = $scope.items.slice(begin, end);
                    });

     //   });
   
}]);

//------------------------------------java script-----------------------------

function getcareerbuilder(url,kw,callback)
{
    //alert(url);
    var rs = [];
    var lc  = "ho chi minh";
    var arrLocation = lc.split(" ");
    var b2 = "";
    for (var i = 0; i< lc.split(" ").length;i++) {
        b2 = b2 + arrLocation[i].substr(0, 1);
    }
    console.log("chuoi la "+b2);

   AcrawlByXMLHttpRequest(url + kw.replace(/ /g, '-')+ '-k-vi.html', function(hmtlString) {
        AhtmlParser(hmtlString, 'dd.brief').each(function(i, jobs) {
            var dt = $(this);
            var dateposted, title, city, description, link, company,id,salary;
            id = guid();
            city = $('p.location',jobs).text();
            salary = $('p.salary',jobs).text() + 'cuc';
            title = $('h3.job',jobs).text();
            link = dt.children().next().eq(0).children().children().attr('href');//$('a.job',jobs).attr('href');
            dateposted = $('div.dateposted',jobs).text();
            description = $('p.rc_jobDescription',jobs).text();
            var drr = description.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ");
            company = dt.children().children().next().eq(0).children().text();//$('span.location',jobs).text();
            if (!$('img', jobs).attr('data-original')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = $('img', jobs).attr('data-original');
            }
            var date = dateposted.split("Dăng tuyển: ");
            var json = {
                _id: id,
                postedDate : date,
                title : title, 
                location : city, 
                description : "", 
                link : link,
                company : company,
                image : img,
                salary : salary
                source : 'http://careerbuilder.vn'
            };
            rs.push(json);
        })
        console.log(rs);
        callback(rs);
    });

    var urlMywork = 'https://mywork.com.vn/tim-viec-lam/';
    var linkMywork = '';
    if(lc.indexOf("all") == -1)
    {
        linkMywork = urlMywork + kw.replace(/ /g, '-')+ '.html';
    }
    else
    {
        linkMywork = urlMywork + kw.replace(/ /g, '-') + '-tai-' + kw.replace(/ /g, '-') + 'w2.html';
    }

    AcrawlByXMLHttpRequest(urlMywork + kw.replace(/ /g, '-')+ '.html', function(hmtlString) {
        var a = url + kw.replace(/ /g, '-')+ '.html';
        AhtmlParser(hmtlString, 'div.item').each(function(i, jobs) {
            var dt = $(this);
            var datetime, title, city, description, link,company, img, salary, id;
            id = guid();
            city = $('a:last',jobs).text();
            salary = dt.children().next().eq(0).text();//$('span:first',jobs).text() + '-' + $('span:last',jobs).text();
            title = (dt.children().children().eq(0).text()).trim();
            link = 'https://mywork.com.vn' + $('a.title',jobs).attr('href');
            datetime = dt.children().next().next().children().next().children().eq(0).text();
            description = $('small',jobs).text();
            var des = '...'+description.split('...')[1]+'...';
            company =(dt.children().next().next().children().children().children().next().eq(0).text()).trim();
            if (!$('img', jobs).attr('src')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
                "_id":id,    
                "expireDate" : datetime,
                "title" : title, 
                "location" : city, 
                "description" : "Nhấn vào đề xem chi tiết công việc", 
                "link" : link,
                "company" : company,
                "image" : img,
                "salary" : salary
                "source" : 'https://mywork.com.vn'
            };
            rs.push(json);           
        });
        console.log(rs);
        callback(rs);
    });
    
    var urlCareerlink = 'https://www.careerlink.vn/viec-lam/k/';

    AcrawlByXMLHttpRequest(urlCareerlink + kw.replace(/ /g, '%2520')+ '?keyword_use=A', function(hmtlString) {
        var a = url + kw.replace(/ /g, '-')+ '?keyword_use=A';
        AhtmlParser(hmtlString, 'div.list-group-item').each(function(i, jobs) {
            var datetime, title, city, description, link,company, img, salary, id;
            id = guid();
            var dt = $(this);
            var location = $('p.priority-data',jobs).text();
            city = location.split('-')[1].replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,"").replace(/\s+/g," ");
            console.log(city);
           // city = loc1;//$('a:last',jobs).text();
            salary = (($('small:first',jobs).text()).split('|')[0]).trim();
            title = $('a:first',jobs).text();
            link = 'https://www.careerlink.vn' + $('a:first',jobs).attr('href');
            datetime = dt.children().next().children().next().eq(3).children().text();
            var description = dt.children().next().children().next().eq(0).children().children().next().children().text();//$('small',jobs).text(); //
            console.log(description);
            company = $('a.text-accent',jobs).text();
            if (!$('img', jobs).attr('src')) {
                img = "http://static.careerbuilder.vn/themes/kiemviecv32/images/graphics/logo-default.png";
            } else {
                img = 'https://www.careerlink.vn'+$('img', jobs).attr('src');
            }
            var json = {
                _id: id,
                postedDate : datetime,
                title : title, 
                location : city, 
                description : description, 
                link : link,
                company : company,
                image : img,
                salary : salary
                source : 'https://www.careerlink.vn'
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

function b()
{
     var rs = [];
    var json = {
                datetime : "datetime",
                title : "title", 
                location : "city", 
                description : "description", 
                link : "link",
                company : "company",
                image : "img",
                salary : 'select to view'
            };
      var json2 = {
                datetime : "datetime",
                title : "heeee", 
                location : "city", 
                description : "description", 
                link : "link",
                company : "company",
                image : "img",
                salary : 'select to view'
            };       
    rs.push(json);
    rs.push(json2);
    console.log(rs);
            return rs;
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