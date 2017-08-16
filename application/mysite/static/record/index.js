
host='http://'+window.location.host
//host='http://23.106.145.39:8000'


//全局变量,用于保存发布时间
var temp_publish_date

var today_str
var yesterday_str



    //文档就绪函数
$(document).ready(function(){
//	get_current_time()
//
//  	get_home_page()
	hook_callbacks()
});


//导航栏点击事件
function hook_callbacks(){

	$("#demo-navbar .container  a").click(function(){
		//让展开视图缩回
		var expanded_change=$("#bs-example-navbar-collapse-1")
		expanded_change.removeClass('in').attr({'aria-expanded':'false'})

		//获取对应列表数据
		var type_str=$(this).attr("href").slice(1)
		if (type_str=='context'){
			get_about_page()
			
		}else if(type_str=='home'){
			get_home_page()
			
		}else{
			get_records_content(type_str)
			
		}
	})

}

//联系我们
function get_about_page(){

	$.ajax({
		url:host+'/index/about',
		type:'get',
		success:function(content){
			remove_page_content()
			var $container = $('#page_content')//容器
			$container.css("padding",0)
			$container.append(content)
		},
		error:function(error){
			console.log(error)
		}
	})

}
//创建首页
function get_home_page(){

	$.ajax({
		url:host+'/index/home',
		type:'get',
		success:function(content){
			remove_page_content()
			var $container = $('#page_content')//容器
			$container.css("padding",0)
			$container.append(content)



		},
		error:function(error){
			console.log(error)
		}
	})



}

function get_current_time(){
	today_str=get_someday_string(0)
	yesterday_str=get_someday_string(-1)
}

function get_someday_string(count){
	var some_day = new Date();
	some_day.setDate(some_day.getDate()+count)

	year=some_day.getFullYear()
	month=some_day.getMonth()+1 //获取当前月份 要记得 +1 !
	day=some_day.getDate()

	temp_str=year+"-"+(month<10?"0"+month:month)+"-"+(day<10?"0"+day:day)
	return temp_str
}


function get_records_content(type_str){
	$.ajax({
		url:host+'/index/list/'+type_str,
		type:'get',
		success:function (content){

			//移除之前内容
			remove_page_content()
			$('#page_content').css({
				"padding-right":"20%",
				"padding-left":"20%",
			})
			list=content.list
			for (var i = 0; i < list.length; i++) {
				object=list[i]
				if (object.record_type == "type_video") {
					create_type_video_html(object)
				}else if (object.record_type == "type_phtoto") {
					create_type_phtoto_html(object)
				}else if (object.record_type == "type_program") {
					create_type_travel_program_html(object)
				}else if (object.record_type == "type_travel") {
					create_type_travel_program_html(object)
				}
			}
		},
		error:function (error){
			console.log(error)
		}
	})

}

function remove_page_content(){
	var $container = $('#page_content')//容器
	$container.empty()
}

function create_type_video_html(object){
	var $container = $('#page_content')//容器
	var $template = $('script#video_template')//模版

    var cover_url = host+object.banner;
	var $elem = $($template.html())


	if (temp_publish_date!=object.publish_date) {
		//如果当前cell 的时间跟上一个cell的时间不相等,那么时间就显示,分割线不显示.否则相反
		$elem.find('.devider').attr('width',0)
		var publish_time=$elem.find('.publish_time')
		switch (object.publish_date) {
			case today_str:{
				publish_time.text('今天')
				break;
			}
			case yesterday_str:{
				publish_time.text('昨天')
				break;
			}
			default:{
				publish_time.text(object.publish_date)
				break;
			}
		}
		temp_publish_date=object.publish_date
	}



	$elem.find('.description').text(object.article_description)
    $elem.find('.banner').attr('src', cover_url)
    $elem.find('.video').text(object.video)
	$container.append($elem) //在容器结尾放入元素
}


function create_type_phtoto_html(object){
	var $container=$('#page_content')
	var $template_container=$('script#phote_template')
	var $elem=$($template_container.html())
	$elem.find('.text-content').text(object.article_description)

	if (temp_publish_date!=object.publish_date) {
		//如果当前cell 的时间跟上一个cell的时间不相等,那么时间就显示,分割线不显示.否则相反
		$elem.find('.devider').attr('width',0)
		var publish_time=$elem.find('.publish_time')
		switch (object.publish_date) {
			case today_str:{
				publish_time.text('今天')
				break;
			}
			case yesterday_str:{
				publish_time.text('昨天')
				break;
			}
			default:{
				publish_time.text(object.publish_date)
				break;
			}
		}
		temp_publish_date=object.publish_date
	}


	imgs=object.record_imgs
	for (var i = 0; i <imgs.length; i++) {

		img=imgs[i]
		var $template_img=$('script#img_template')
		$elem_img=$($template_img.html())
		$elem_img.find('#photo_img').attr('src',img.imgurl)

		//img模板添加到cell
		$elem.find('.row').append($elem_img)
	}


	//将cell添加到tableView
	$container.append($elem)
}

function create_type_travel_program_html(object){
	var $container=$('#page_content')
	var $template=$('script#text_template')

	var $elem=$($template.html())

	if (temp_publish_date!=object.publish_date) {
		//如果当前cell 的时间跟上一个cell的时间不相等,那么时间就显示,分割线不显示.否则相反
		$elem.find('.devider').attr('width',0)
		var publish_time=$elem.find('.publish_time')
		switch (object.publish_date) {
			case today_str:{
				publish_time.text('今天')
				break;
			}
			case yesterday_str:{
				publish_time.text('昨天')
				break;
			}
			default:{
				publish_time.text(object.publish_date)
				break;
			}
		}
		temp_publish_date=object.publish_date
	}



	$elem.find('.title').text(object.title)
	$elem.find('.description').text(object.article_description)

	$container.append($elem) //在容器结尾放入元素

}



