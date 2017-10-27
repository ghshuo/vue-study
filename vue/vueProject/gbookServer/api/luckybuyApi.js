var express = require('express');
var mhelper = require('../models/mhelper.js');
var _config=require('../common/_config');


var router = express.Router();
var baeBosUrl = _config.fileuploadpath.defaultPath;
if (_config.isBaeBosUploadImages.isOpen) {
    baeBosUrl = _config.isBaeBosUploadImages.url;
}

/*幸运购菜单*/
router.get('/getMenu', function (req, res, next) {
    mhelper.query('SELECT webmenu_id,menu_name,target_url FROM webmenu WHERE is_use=1 AND menu_level=1 AND menu_type=2 ORDER BY sort_index ASC ').then(function (results) {
        console.log(results[0]);
        res.send(results[0]);
        res.end();
    });
});

/*banner*/
router.get('/getLuckAd', function (req, res, next) {
	var offset = req.query.offset;
	var limit = req.query.limit;
	// console.log('offset='+offset);
	// console.log('limit='+limit);
    mhelper.query("SELECT adviertisement_id,adviertisement_title," +
        "(CASE WHEN adviertisement_image1 IS NOT NULL THEN CONCAT('" + baeBosUrl + "',adviertisement_image1) ELSE NULL END) AS adviertisement_image1," +
        "adviertisement_url FROM adviertisement WHERE adviertisement_type= 20 AND adviertisement_state=3 ORDER BY sort_index DESC limit "+offset+","+limit).then(function (results) {
            res.send(results[0]);
            res.end();
        });
    });

/*即将揭晓*/
router.get('/getAdver', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;

    mhelper.query("SELECT luck_activity_list_id,activity_list_title," +
        "(CASE WHEN  b.book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover) ELSE NULL END) AS book_cover ,act_amount,remain_amount,plan_amount,hold_number" +
        " ,@n:=@n+1 num ,FLOOR((@m:=@m+1)/2+1) class FROM (select @m:=-1) table1, (select @n:=0) table2, luck_activity_list lal" +
        " LEFT JOIN book b ON b.book_id=lal.goods_id WHERE activity_list_state=4 ORDER BY remain_amount LIMIT "+offset+","+limit).then(function (results) {

            var sult = results[0];
            var n = Math.ceil(sult.length/2);
            var i=0;
            var data = new Array();
            while(i<n){
                data.push({ino:'i'+i,iname:[sult[2*i],sult[2*i+1]]});
                i++;
            }
        // console.log('i='+i);
        res.send(data);
        res.end();
    });
});

/*新闻公告*/
router.get('/getLuckMessages', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    mhelper.query("SELECT messages_id,messages_title,'#' AS messages_url " +
        " FROM messages WHERE messages_state=4 AND messages_type=2 ORDER BY release_date DESC limit "+offset+","+limit).then(function (results) {
            res.send(results[0]);
            res.end();
        });
    });

/*最新中奖*/
router.get('/getPrizeAffiche', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    mhelper.query("SELECT lpa.luck_prize_affiche_id,lpa.luck_activity_list_id,lpa.user_id,u.name AS user_name,DATE_FORMAT(lpa.announce_date,'%Y-%m-%d') AS announce_date" +
        ",lpa.goods_id AS goods_id"+
        ",bk.book_name,sum_plan_amount,cnt_affiche"+
        ",(CASE WHEN  u.headimg IS NOT NULL THEN CONCAT('" + baeBosUrl + "',u.headimg) ELSE NULL END) AS headimg " +
        " FROM luck_prize_affiche lpa INNER JOIN user u ON lpa.user_id = u.user_id "+
        " INNER JOIN book bk ON lpa.goods_id = bk.book_id " +
        " INNER JOIN ( "+
        " SELECT lp.goods_id,SUM(la.plan_amount) AS sum_plan_amount,COUNT(*) AS cnt_affiche "+
        " FROM luck_prize_affiche lp INNER JOIN luck_activity_list la ON lp.luck_activity_list_id = la.luck_activity_list_id "+
        " WHERE lp.luck_prize_affiche_state = 6 "+   
        " GROUP BY lp.goods_id "+ 
        " ) AS hz ON lpa.goods_id = hz.goods_id "+
        " ORDER BY lpa.announce_date DESC LIMIT "+offset+","+limit).then(function (results) {

            res.send(results[0]);
            res.end();
        });
    });

/*最新揭晓*/
router.get('/getNewestAnnounce', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var sql = "";
    sql += "SELECT luck_activity_list_id,activity_list_title,(announced_duration*60) announced_duration";
    sql += ",(CASE WHEN  book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',book_cover) ELSE NULL END) AS book_cover "
    sql +=",'#' AS lcdetail_url "
    sql += ",act_amount,remain_amount,plan_amount,hold_number";
    sql += " FROM ( "
    sql += " SELECT luck_activity_list_id,activity_list_title,announced_duration ,book_cover,act_amount,remain_amount,plan_amount,hold_number ";
    sql += " FROM luck_activity_list lal ";
    sql += " LEFT JOIN book b ON b.book_id=lal.goods_id WHERE act_amount=plan_amount AND activity_list_state=5 ";
    var i = 0;
    while (i < limit) {
        sql += " UNION ALL SELECT 0 luck_activity_list_id,'',6 ,'',0,0,0,0";
        i++;
    }
    sql += ") aa"
    sql += " LIMIT "+offset+","+limit;
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*最新揭晓-更多*/
router.get('/getNewestAnnounceMore', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit;
    var sql = "";
    sql+=" SELECT lal.luck_activity_list_id,lal.activity_list_title,lpa.announce_date,";
    sql+=" (lal.announced_duration*60) AS announced_duration"
    sql+=" ,(CASE WHEN b.book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover) ELSE NULL END) AS book_cover "
    sql+=" ,lal.act_amount,lal.remain_amount,lal.plan_amount,lal.hold_number,lpa.lucky_number,lpa.total_number,u.name "
    sql+=" FROM luck_activity_list lal "
    sql+=" LEFT JOIN book b ON b.book_id=lal.goods_id ";
    sql+=" LEFT JOIN luck_prize_affiche lpa ON lpa.luck_activity_list_id=lal.luck_activity_list_id ";
    sql+=" LEFT JOIN user u ON u.user_id=lpa.user_id ";
    sql+=" WHERE lal.act_amount = lal.plan_amount ";
    sql+=" AND lal.activity_list_state=5 ";
    sql+=" AND lpa.announce_date > DATE_SUB(now(),INTERVAL 3 DAY) ";
    sql+=" LIMIT "+offset+","+limit;
    // console.log("page="+page);
    // console.log("limit="+limit);
    // console.log("offset="+offset);       
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*最新揭晓-最快揭晓*/
router.get('/getNewestAnnounceFastest', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit;
    var sql = "";
    sql+=" SELECT lal.luck_activity_list_id,lal.activity_list_title,lpa.announce_date";
    sql+=" ,(CASE WHEN b.book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover) ELSE NULL END) AS book_cover "
    sql+=" ,lal.remain_amount,lal.plan_amount,lal.act_amount,lpa.total_number "
    sql+=" FROM luck_activity_list lal "
    sql+=" LEFT JOIN book b ON b.book_id=lal.goods_id ";
    sql+=" LEFT JOIN luck_prize_affiche lpa ON lpa.luck_activity_list_id=lal.luck_activity_list_id ";
    sql+=" WHERE lal.activity_list_state IN(4,5) ";
    sql+=" AND lpa.announce_date > DATE_SUB(now(),INTERVAL 3 DAY) ";
    sql+=" ORDER BY lal.remain_amount ";     
    sql+=" LIMIT "+offset+","+limit;     
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*热门推荐-首页*/
router.get('/getHotRecommendation', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var sql = "";
    sql+="SELECT luck_activity_list_id,activity_list_title,book_id";
    sql +=",'#' AS lcdetail_url "    
    sql+=",(CASE WHEN  book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',book_cover) ELSE NULL END) AS book_cover "
    sql+=",act_amount,remain_amount,plan_amount,hold_number ";
    sql+=" FROM (";
    sql+=" SELECT luck_activity_list_id,activity_list_title,b.book_id,book_cover,act_amount,remain_amount,plan_amount,hold_number "
    sql+=" FROM luck_activity_list lal";
    sql+=" LEFT JOIN book b ON b.book_id=lal.goods_id WHERE activity_list_state=4 AND category_id= 1 ";
    var i = 0;
    while (i < limit) {
        sql += " UNION ALL SELECT 0 luck_activity_list_id,'','',0,0,0,0,0";
        i++;
    }
    sql += ") aa"
    sql += " LIMIT "+offset+","+limit;
    // console.log(sql);
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});


/*热门推荐-更多*/
router.get('/getHotRecommendationMore', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit ;
    var filterkey = req.query.filterkey;
    var sql = "";
    sql+="SELECT luck_activity_list_id,activity_list_title";
    sql +=",'#' AS lcdetail_url "    
    sql+=",(CASE WHEN  book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',book_cover) ELSE NULL END) AS book_cover "
    sql+=",act_amount,remain_amount,plan_amount,hold_number ";
    sql+=" FROM (";
    sql+=" SELECT luck_activity_list_id,activity_list_title,book_cover,act_amount,remain_amount,plan_amount,hold_number "
    sql+=" FROM luck_activity_list lal";
    sql+=" LEFT JOIN book bk ON bk.book_id=lal.goods_id WHERE activity_list_state=4 AND category_id= 1 ";
    sql+=" AND bk.classtags LIKE '%"+filterkey+"%'"
    // var i = 0;
    // while (i < limit) {
    //     sql += " UNION ALL SELECT 0 luck_activity_list_id,'','',0,0,0,0";
    //     i++;
    // }    
    sql += ") aa"
    sql += " LIMIT "+offset+","+limit;
    // console.log("page="+page);
    // console.log("limit="+limit);
    // console.log("offset="+offset);    
    // console.log("filterkey="+filterkey);      
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});


/*新品上架*/
router.get('/getNewArrivals', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var sql = "";
    sql+="SELECT luck_activity_list_id,activity_list_title";
    sql+=" ,'#' AS bk_url ";    
    sql+=",(CASE WHEN  book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',book_cover) ELSE NULL END) AS book_cover "
    sql+=",act_amount,remain_amount,plan_amount,hold_number ";
    sql+=" FROM (";
    sql+=" SELECT luck_activity_list_id,activity_list_title,book_cover,act_amount,remain_amount,plan_amount,hold_number "
    sql+=" FROM luck_activity_list lal";
    sql+=" LEFT JOIN book b ON b.book_id=lal.goods_id WHERE activity_list_state=4 AND category_id= 2 ";
    var i = 0;
    while (i < limit) {
        sql += " UNION ALL SELECT 0 luck_activity_list_id,'','',0,0,0,0";
        i++;
    }
    sql += ") aa"
    sql += " LIMIT "+offset+","+limit;
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*新品上架-更多*/
router.get('/getNewArrivalsMore', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit ;
    var filterkey = req.query.filterkey;
    var sql = "";
    sql+="SELECT luck_activity_list_id,activity_list_title";
    sql+=",'#' AS bk_url "    
    sql+=",(CASE WHEN book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',book_cover) ELSE NULL END) AS book_cover "
    sql+=",act_amount,remain_amount,plan_amount,hold_number ";
    sql+=" FROM (";
    sql+=" SELECT luck_activity_list_id,activity_list_title,book_cover,act_amount,remain_amount,plan_amount,hold_number "
    sql+=" FROM luck_activity_list lal";
    sql+=" LEFT JOIN book bk ON bk.book_id=lal.goods_id WHERE activity_list_state=4 AND category_id= 2 ";
    sql+=" AND bk.classtags LIKE '%"+filterkey+"%'"
    // var i = 0;
    // while (i < limit) {
    //     sql += " UNION ALL SELECT 0 luck_activity_list_id,'','',0,0,0,0";
    //     i++;
    // }    
    sql += ") aa"
    sql += " LIMIT "+offset+","+limit;
    // console.log("page="+page);
    // console.log("limit="+limit);
    // console.log("offset="+offset);    
    // console.log("filterkey="+filterkey);      
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*晒单分享*/
router.get('/getLuckBaskSharing', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;
    var sql = "";
    sql+=" SELECT lbo.luck_bask_order_id ";	
    sql+=" ,(CASE WHEN lboi.images_url IS NOT NULL THEN CONCAT('" + baeBosUrl + "',lboi.images_url) ELSE NULL END) AS images_url ";
    sql+=" ,lbo.bask_content,u.nick_name   ";
    sql+=" FROM luck_bask_order lbo ";
    sql+=" LEFT JOIN ( ";
    sql+=" 	SELECT  luck_bask_order_id,MIN(images_url) images_url ";
    sql+=" 	FROM luck_bask_order_images ";
    sql+=" 	GROUP BY  luck_bask_order_id) AS lboi ";  
    sql+=" ON lbo.luck_bask_order_id=lboi.luck_bask_order_id ";    
    sql+=" LEFT JOIN `user` u ON u.user_id=lbo.user_id  ";      
    sql+=" WHERE lbo.luck_bask_order_state=4 "; 
    sql+= " LIMIT "+offset+","+limit; 		   

    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*晒单分享-更多*/
router.get('/getLuckBaskSharingMore', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit;
    var sql = "";
    sql+=" SELECT lbo.luck_bask_order_id,lbo.luck_bask_order_title,";
    sql+=" lbo.luck_bask_order_state,u.name,lbo.luck_user_order_id,"
    sql+=" lbo.evaluation_level,lbo.bask_content,lal.activity_list_title,"
    sql+=" b.book_name,lbo.evaluater,lbo.evaluate_date,lbo.releaser,lbo.release_date "
    sql+=" ,(CASE WHEN lboi.images_url IS NOT NULL THEN CONCAT('" + baeBosUrl + "',lboi.images_url) ELSE NULL END) AS images_url "
    sql+=" FROM luck_bask_order lbo ";
    sql+=" LEFT JOIN luck_activity_list lal ON lal.luck_activity_list_id = lbo.luck_activity_list_id "
    sql+=" LEFT JOIN luck_user_order luo ON luo.luck_user_order_id = lbo.luck_user_order_id ";
    sql+=" LEFT JOIN user u ON u.user_id = lbo.user_id ";
    sql+=" LEFT JOIN book b ON b.book_id = lbo.goods_id ";
    sql+=" LEFT JOIN luck_bask_order_images lboi ON lboi.luck_bask_order_id = lbo.luck_bask_order_id ";
    sql+=" WHERE lbo.luck_bask_order_state=4 ";
    sql+=" LIMIT "+offset+","+limit;
    // console.log("page="+page);
    // console.log("limit="+limit);
    // console.log("offset="+offset);       
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*正在云购*/
router.get('/getShoppingMsg', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;	
    var sql = "";
    sql+=" SELECT luck_user_order_detail_id,activity_list_title,u.nick_name ";  
    sql+=" ,(CASE WHEN  u.headimg IS NOT NULL THEN CONCAT('" + baeBosUrl + "',u.headimg) ELSE NULL END) AS headimg ";
    sql+=" ,date_format(lod.buy_date,'%Y-%m-%d') buy_date ";
    sql+=" ,'#' AS bk_url ";
    sql+=" FROM luck_user_order_detail lod ";
    sql+=" LEFT JOIN luck_user_order luo ON lod.luck_user_order_id=luo.luck_user_order_id ";
    sql+=" LEFT JOIN luck_activity_list la ON lod.luck_activity_list_id=la.luck_activity_list_id ";
    sql+=" LEFT JOIN `user` u ON u.user_id=luo.user_id ";
    sql+=" LEFT JOIN book b ON b.book_id=la.goods_id ";
    sql+= " LIMIT "+offset+","+limit; 

    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});


/*图书详情页面封面小图*/
router.get('/getBookCover', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;    
    var id = req.query.id;   
    var sql = "";
    sql+=" SELECT luck_activity_list_id,activity_list_title ";  
    sql+=" ,(CASE WHEN b.book_cover IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover) ELSE NULL END) AS book_cover  ";
    sql+=" ,(CASE WHEN b.book_cover1 IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover1) ELSE NULL END) AS book_cover1 ";
    sql+=" ,(CASE WHEN b.book_cover2 IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover2) ELSE NULL END) AS book_cover2 ";
    sql+=" ,(CASE WHEN b.book_cover3 IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover3) ELSE NULL END) AS book_cover3 ";
    sql+=" ,(CASE WHEN b.book_cover4 IS NOT NULL THEN CONCAT('" + baeBosUrl + "',b.book_cover4) ELSE NULL END) AS book_cover4 ";
    sql+=" FROM luck_activity_list al ";
    sql+=" LEFT JOIN book b ON b.book_id=al.goods_id ";
    sql+=" WHERE luck_activity_list_id = "+id;
    sql+=" LIMIT "+offset+","+limit; 

    mhelper.query(sql).then(function (results) {
        var sult = results[0][0];
        // console.log(sult);
        // console.log("luck_activity_list_id="+sult.luck_activity_list_id);
        var data = new Array();
        if (sult.book_cover!=null){
            data.push({luck_activity_list_id:sult.luck_activity_list_id
                ,activity_list_title:sult.activity_list_title
                ,book_cover:sult.book_cover});              
        }
        if (sult.book_cover1!=null){
            data.push({luck_activity_list_id:sult.luck_activity_list_id
                ,activity_list_title:sult.activity_list_title
                ,book_cover:sult.book_cover1}); 
        }
        if (sult.book_cover2!=null){
            data.push({luck_activity_list_id:sult.luck_activity_list_id
                ,activity_list_title:sult.activity_list_title
                ,book_cover:sult.book_cover2});            
        }
        if (sult.book_cover3!=null){
            data.push({luck_activity_list_id:sult.luck_activity_list_id
                ,activity_list_title:sult.activity_list_title
                ,book_cover:sult.book_cover3});             
        }
        if (sult.book_cover4!=null){
            data.push({luck_activity_list_id:sult.luck_activity_list_id
                ,activity_list_title:sult.activity_list_title
                ,book_cover:sult.book_cover4});              
        }                
        res.send(data);        
        res.end();
    });
});


/*图书详情页面数据*/
router.get('/getActivityBookDetail', function (req, res, next) {
    var offset = req.query.offset;
    var limit = req.query.limit;    
    var id = req.query.id;      
    var sql = "";
    sql+=" SELECT luck_activity_list_id,activity_list_title,category_id,(announced_duration*60) announced_duration ";  
    sql+=" , hold_number,act_amount,plan_amount,remain_amount,description ";
    sql+=" FROM luck_activity_list ";
    sql+=" WHERE luck_activity_list_id = "+id;
    sql+=" LIMIT "+offset+","+limit; 

    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    });
});

/*获取图书详情页面-参与记录*/
router.get('/getActivityBookParticipateRecord', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit ;
    var id = req.query.id;     
    var sql = "";
    sql+="SELECT buy_date,u.nick_name,buy_amount,login_ip,login_src";
    sql+=" FROM luck_user_order_detail luod "    
    sql+=" LEFT JOIN luck_user_order luo ON luo.luck_user_order_id=luod.luck_user_order_id "
    sql+=" LEFT JOIN `user` u ON luo.submitter=u.user_id ";
    sql+=" LEFT JOIN login_info lu ON lu.login_id=u.user_id ";
    sql+=" WHERE luck_activity_list_id = "+id;
    sql+=" LIMIT "+offset+","+limit;
    // console.log("page="+page);
    // console.log("limit="+limit);
    // console.log("offset="+offset);    
    mhelper.query(sql).then(function (results) {
        res.send(results[0]);
        res.end();
    }); 
});

/*获取图书详情页面-晒单*/
router.get('/getActivityBookBaskSharing', function (req, res, next) {
    var page = req.query.page;
    var limit = req.query.limit;
    var offset = page * limit - limit ;
    var sql = "";
    sql+=" SELECT lbo.luck_bask_order_id ";
    sql+=" ,(CASE WHEN u.headimg IS NOT NULL THEN CONCAT('" + baeBosUrl + "',u.headimg) ELSE NULL END) AS headimg  ";
    sql+=" ,u.nick_name,lbo.luck_bask_order_title,lal.hold_number,lbo.submit_date,lbo.bask_content ";
    sql+=" ,(CASE WHEN lboi.images_url IS NOT NULL THEN CONCAT('" + baeBosUrl + "',lboi.images_url) ELSE NULL END) AS images_url  ";
    sql+=" FROM luck_bask_order_images lboi ";
    sql+=" LEFT JOIN luck_bask_order lbo ON lboi.luck_bask_order_id=lbo.luck_bask_order_id ";
    sql+=" LEFT JOIN luck_activity_list lal ON lal.luck_activity_list_id=lbo.luck_activity_list_id ";
    sql+=" LEFT JOIN `user` u ON lbo.user_id=u.user_id ";
    sql+=" LIMIT "+offset+","+limit;
    mhelper.query(sql).then(function (results) {
        var len = results[0].length;
        var arry = [];
        var sid = null;
        for (var i = 0; i < len; i++) {
            if (sid != results[0][i].luck_bask_order_id) {
                arry.push({
                    luck_bask_order_id: results[0][i].luck_bask_order_id,
                    award_name: results[0][i].award_name,
                    headimg: results[0][i].headimg,
                    luck_bask_order_title: results[0][i].luck_bask_order_title,
                    hold_number: results[0][i].hold_number,
                    submit_date: results[0][i].submit_date,
                    bask_content: results[0][i].bask_content,
                    last: []
                });
                sid = results[0][i].luck_bask_order_id;
            }

            arry[arry.length - 1].last.push(results[0][i]);
        }
        // console.log("arry="+arry);        
        res.send(arry);
        res.end();
    }); 
});

module.exports = router;

