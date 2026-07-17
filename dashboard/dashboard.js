﻿﻿(function () {
    var chartsInitialized = false;
    var charts = {};

    function initDashboard() {
        if (chartsInitialized) return;
        if (typeof echarts === 'undefined') return;
        chartsInitialized = true;
        animateKPIs();
        initMapChart();
        initRankChart();
        initRingChart();
        initBar3DChart();
        initScatterChart();
        initHeatmapChart();
        startDynamicUpdate();
    }

    function animateKPIs() {
        var els = document.querySelectorAll('.dash-kpi-value');
        els.forEach(function (el) {
            var target = parseFloat(el.getAttribute('data-target'));
            var duration = 1500;
            var startTime = null;
            var isInt = target > 100;
            function step(ts) {
                if (!startTime) startTime = ts;
                var progress = Math.min((ts - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = target * eased;
                el.textContent = isInt ? Math.round(current) : current.toFixed(2);
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = isInt ? target : target.toFixed(2);
            }
            requestAnimationFrame(step);
        });
    }

    function tc() {
        var dk = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            text: dk ? '#f5f1ea' : '#1c1917',
            ts: dk ? '#c4bdb1' : '#57534e',
            tm: dk ? '#8a8378' : '#8a8378',
            pri: dk ? '#f97316' : '#c2410c',
            prl: dk ? '#fb923c' : '#ea580c',
            brd: dk ? '#2e2823' : '#e7e0d5',
            bg: dk ? '#1a1714' : '#faf7f2',
            bgc: dk ? '#1f1b16' : '#fffefb',
            ac: dk ? '#2a2420' : '#e8e0d2',
            ah: dk ? '#3a3228' : '#d6cdbd'
        };
    }

    var cityCoords = {
        '北京市':[116.46,39.92],'上海市':[121.48,31.22],'广东省':[113.23,23.16],
        '浙江省':[120.19,30.26],'四川省':[104.06,30.67],'湖北省':[114.31,30.52],
        '江苏省':[118.78,32.04],'陕西省':[108.95,34.27],'重庆市':[106.54,29.59],
        '湖南省':[112.94,28.23],'河南省':[113.65,34.76],'安徽省':[117.27,31.86],
        '山东省':[117.00,36.65],'福建省':[119.30,26.08],'辽宁省':[123.38,41.80],
        '黑龙江省':[126.63,45.75],'云南省':[102.73,25.04],'天津市':[117.20,39.13],
        '贵州省':[106.71,26.57],'甘肃省':[103.73,36.03],'海南省':[110.35,20.02],
        '西藏自治区':[91.11,29.97],'新疆维吾尔自治区':[87.68,43.77],
        '广西壮族自治区':[108.33,22.84],'内蒙古自治区':[111.65,40.82],
        '山西省':[112.55,37.87],'江西省':[115.89,28.68],'吉林省':[125.35,43.88],
        '河北省':[114.48,38.03],'宁夏回族自治区':[106.27,38.47],'青海省':[101.78,36.62]
    };

    var aiUsersData = [
        {name:'北京市',value:412},{name:'上海市',value:387},{name:'广东省',value:298},
        {name:'浙江省',value:245},{name:'四川省',value:198},{name:'湖北省',value:167},
        {name:'江苏省',value:156},{name:'陕西省',value:134},{name:'重庆市',value:128},
        {name:'湖南省',value:112},{name:'河南省',value:98},{name:'安徽省',value:89},
        {name:'山东省',value:76},{name:'福建省',value:72},{name:'辽宁省',value:65},
        {name:'黑龙江省',value:48},{name:'云南省',value:45},{name:'天津市',value:95},
        {name:'贵州省',value:35},{name:'甘肃省',value:28},{name:'海南省',value:22},
        {name:'西藏自治区',value:8},{name:'新疆维吾尔自治区',value:15},
        {name:'广西壮族自治区',value:32},{name:'内蒙古自治区',value:42},
        {name:'山西省',value:55},{name:'江西省',value:48},{name:'吉林省',value:38},
        {name:'河北省',value:88},{name:'宁夏回族自治区',value:12},{name:'青海省',value:10}
    ];

    function initMapChart() {
        var dom = document.getElementById('chart-map');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.map = chart;
        chart.showLoading({text:'地图加载中...',color:c.pri,textColor:c.text});

        fetch('dashboard/china.json')
            .then(function(r){return r.json();})
            .then(function(geoJson){
                chart.hideLoading();
                echarts.registerMap('china', geoJson);

                var scatterData = [];
                aiUsersData.forEach(function(item){
                    var coord = cityCoords[item.name];
                    if(coord) scatterData.push({name:item.name,value:[coord[0],coord[1],item.value]});
                });



                var mapValues = aiUsersData.map(function(d){return {name:d.name,value:d.value};});

                chart.setOption({
                    title:{text:'全国AI用户分布',left:'center',top:8,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
                    tooltip:{
                        trigger:'item',
                        backgroundColor:c.bgc,borderColor:c.brd,
                        textStyle:{color:c.text,fontFamily:'Manrope, sans-serif',fontSize:13},
                        formatter:function(p){
                            if(p.seriesType==='effectScatter') return p.name.replace(/市$|省$|自治区$|壮族$|回族$|维吾尔$|特别行政区$/,'')+'<br/>AI用户: '+p.value[2]+' 万';
                            if(p.seriesType==='map') return p.name.replace(/市$|省$|自治区$|壮族$|回族$|维吾尔$|特别行政区$/,'')+'<br/>AI用户: '+(p.value||0)+' 万';
                            return p.name;
                        }
                    },
                    visualMap:{
                        min:0,max:420,left:20,bottom:20,
                        text:['高','低'],
                        textStyle:{color:c.tm,fontFamily:'Manrope, sans-serif'},
                        inRange:{color:[c.ac,c.prl,c.pri]},
                        calculable:true,
                        seriesIndex:0
                    },
                    geo:{
                        map:'china',roam:true,zoom:1.15,
                        itemStyle:{areaColor:c.ac,borderColor:c.brd,borderWidth:0.6},
                        emphasis:{itemStyle:{areaColor:c.ah},label:{show:true,color:c.text,fontFamily:'Manrope, sans-serif'}},
                        label:{show:false}
                    },
                    series:[
                        {
                            name:'AI用户',type:'map',map:'china',geoIndex:0,
                            data:mapValues
                        },
                        {
                            name:'涟漪散点',type:'effectScatter',
                            coordinateSystem:'geo',geoIndex:0,zlevel:2,
                            data:scatterData,
                            symbolSize:function(val){return Math.max(6,val[2]/20);},
                            showEffectOn:'render',
                            rippleEffect:{period:3,scale:5,brushType:'fill'},
                            label:{show:false},
                            emphasis:{label:{show:true,position:'right',formatter:'{b}',color:c.text,fontFamily:'Manrope, sans-serif',fontSize:12}},
                            itemStyle:{color:c.pri,shadowBlur:15,shadowColor:c.pri+'80'}
                        }
                    ]
                });
                window.addEventListener('resize',function(){chart.resize();});
            })
            .catch(function(err){chart.hideLoading();console.error('Map error:',err);});
    }

    function initRankChart() {
        var dom = document.getElementById('chart-rank');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.rank = chart;

        var cities = ['北京市','上海市','广东省','浙江省','四川省','湖北省','江苏省','陕西省','重庆市','湖南省'];
        var values = [412,387,298,245,198,167,156,134,128,112];

        chart.setOption({
            title:{text:'AI用户 TOP10',left:'center',top:8,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
            tooltip:{trigger:'axis',backgroundColor:c.bgc,borderColor:c.brd,textStyle:{color:c.text,fontFamily:'Manrope, sans-serif'},formatter:function(p){return p[0].name+': '+p[0].value+' 万'}},
            grid:{left:60,right:30,top:40,bottom:15},
            xAxis:{type:'value',show:false},
            yAxis:{type:'category',data:cities.reverse(),inverse:true,axisLine:{show:false},axisTick:{show:false},axisLabel:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:11}},
            series:[{
                type:'bar',
                data:values.reverse(),
                barWidth:14,
                label:{show:true,position:'right',color:c.pri,fontFamily:'JetBrains Mono, monospace',fontSize:11,formatter:'{c} 万'},
                itemStyle:{
                    borderRadius:[0,4,4,0],
                    color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:c.pri+'30'},{offset:1,color:c.pri}])
                },
                animationDuration:1500,
                animationEasing:'cubicOut'
            }]
        });
        window.addEventListener('resize',function(){chart.resize();});
    }

    function initRingChart() {
        var dom = document.getElementById('chart-ring');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.ring = chart;

        chart.setOption({
            title:{text:'AI应用行业分布',left:'center',top:8,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
            tooltip:{trigger:'item',backgroundColor:c.bgc,borderColor:c.brd,textStyle:{color:c.text,fontFamily:'Manrope, sans-serif'},formatter:'{b}: {d}%'},
            series:[{
                type:'pie',radius:['45%','70%'],center:['50%','55%'],
                avoidLabelOverlap:true,
                itemStyle:{borderRadius:5,borderColor:c.bgc,borderWidth:2},
                label:{show:true,color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:11,formatter:'{b}\n{d}%'},
                labelLine:{lineStyle:{color:c.brd}},
                data:[
                    {value:28,name:'金融',itemStyle:{color:c.pri}},
                    {value:22,name:'医疗',itemStyle:{color:c.prl}},
                    {value:16,name:'制造',itemStyle:{color:'#eab308'}},
                    {value:12,name:'教育',itemStyle:{color:'#22c55e'}},
                    {value:10,name:'零售',itemStyle:{color:'#06b6d4'}},
                    {value:7,name:'交通',itemStyle:{color:'#8b5cf6'}},
                    {value:3,name:'能源',itemStyle:{color:c.tm}},
                    {value:2,name:'农业',itemStyle:{color:c.ac}}
                ],
                animationType:'scale',animationDuration:1500
            }]
        });
        window.addEventListener('resize',function(){chart.resize();});
    }

    function initBar3DChart() {
        var dom = document.getElementById('chart-bar3d');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.bar3d = chart;

        var industries = ['金融','医疗','教育','制造','零售','交通','能源','农业'];
        var metrics = ['市场规模','增长率','渗透率'];
        var rawData = [
            [1200,35,62],[850,42,38],[620,28,45],[980,31,52],
            [560,25,40],[430,48,28],[350,22,30],[180,55,15]
        ];
        var maxVals = [1200,55,62];
        var data = [];
        for(var i=0;i<industries.length;i++){
            for(var j=0;j<metrics.length;j++){
                data.push({
                    value:[i,j,Math.round(rawData[i][j]/maxVals[j]*100)],
                    rawDataVal:rawData[i][j],
                    metricName:metrics[j],
                    industryName:industries[i]
                });
            }
        }

        chart.setOption({
            title:{text:'AI行业三维竞争力',left:'center',top:5,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
            tooltip:{
                formatter:function(p){
                    return p.data.industryName+' · '+p.data.metricName+'<br/>'+p.data.metricName+': '+p.data.rawDataVal+(p.data.metricName==='市场规模'?'亿':'%');
                },
                backgroundColor:c.bgc,borderColor:c.brd,textStyle:{color:c.text,fontFamily:'Manrope, sans-serif'}
            },
            visualMap:{
                max:100,min:0,calculable:true,
                orient:'horizontal',left:'center',bottom:0,
                textStyle:{color:c.tm,fontFamily:'Manrope, sans-serif'},
                inRange:{color:['#313695','#4575b4','#74add1','#abd9e9','#fee090','#fdae61','#f46d43','#d73027']}
            },
            xAxis3D:{
                type:'category',data:industries,
                axisLabel:{color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:9,rotate:30},
                axisLine:{lineStyle:{color:c.brd}}
            },
            yAxis3D:{
                type:'category',data:metrics,
                axisLabel:{color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:10},
                axisLine:{lineStyle:{color:c.brd}}
            },
            zAxis3D:{
                type:'value',name:'归一化',
                axisLabel:{color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:10},
                axisLine:{lineStyle:{color:c.brd}}
            },
            grid3D:{
                boxWidth:160,boxDepth:50,boxHeight:50,
                viewControl:{distance:220,alpha:22,beta:30,autoRotate:true,autoRotateSpeed:4},
                light:{main:{intensity:1.2,shadow:true},ambient:{intensity:0.4}},
                axisLine:{lineStyle:{color:c.brd}},
                axisPointer:{lineStyle:{color:c.pri}},
                environment:'auto'
            },
            series:[{
                type:'bar3D',
                data:data,
                shading:'lambert',
                label:{show:false},
                itemStyle:{opacity:0.85},
                emphasis:{itemStyle:{color:c.pri}},
                animationDurationUpdate:500
            }]
        });
        window.addEventListener('resize',function(){chart.resize();});
    }

    function initScatterChart() {
        var dom = document.getElementById('chart-scatter');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.scatter = chart;

        var indicators = [
            {name:'语言理解',max:100},
            {name:'代码生成',max:100},
            {name:'多模态',max:100},
            {name:'推理能力',max:100},
            {name:'长文本',max:100},
            {name:'中文能力',max:100},
            {name:'开源生态',max:100},
            {name:'性价比',max:100}
        ];

        var models = [
            {name:'ChatGPT',color:'#10a37f',data:[95,92,88,90,75,72,30,45]},
            {name:'Gemini',color:'#4285f4',data:[90,85,95,88,92,60,25,50]},
            {name:'Grok',color:'#1d9bf0',data:[82,80,70,85,78,55,50,55]},
            {name:'GLM',color:c.pri,data:[88,82,78,85,80,95,70,80]},
            {name:'Qwen',color:'#615bff',data:[86,88,82,83,88,93,85,75]},
            {name:'DeepSeek',color:'#4f46e5',data:[84,93,65,92,82,90,95,95]}
        ];

        var series = models.map(function(m){
            return {
                name:m.name,type:'radar',
                data:[{value:m.data,name:m.name}],
                symbol:'circle',symbolSize:4,
                lineStyle:{width:2,color:m.color},
                itemStyle:{color:m.color},
                areaStyle:{color:m.color+'18'},
                emphasis:{lineStyle:{width:3},areaStyle:{color:m.color+'30'}}
            };
        });

        chart.setOption({
            title:{text:'主流大模型多维对比',left:'center',top:8,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
            tooltip:{
                trigger:'item',
                backgroundColor:c.bgc,borderColor:c.brd,
                textStyle:{color:c.text,fontFamily:'Manrope, sans-serif',fontSize:12},
                formatter:function(p){
                    var res=p.name+'<br/>';
                    indicators.forEach(function(ind,i){
                        res+=ind.name+': '+p.value[i]+'<br/>';
                    });
                    return res;
                }
            },
            legend:{
                data:models.map(function(m){return m.name;}),
                bottom:5,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:10},
                itemWidth:14,itemHeight:8,itemGap:14
            },
            radar:{
                indicator:indicators,
                center:['50%','52%'],
                radius:'62%',
                shape:'polygon',
                splitNumber:5,
                axisName:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:10},
                splitLine:{lineStyle:{color:c.brd}},
                splitArea:{areaStyle:{color:[c.ac+'00',c.ac+'30']}},
                axisLine:{lineStyle:{color:c.brd}}
            },
            series:series
        });
        window.addEventListener('resize',function(){chart.resize();});
    }

    function initHeatmapChart() {
        var dom = document.getElementById('chart-heatmap');
        if (!dom) return;
        var c = tc();
        var chart = echarts.init(dom);
        charts.heatmap = chart;

        var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        var monthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
        var seasonFactor = [0.7,0.6,0.8,0.85,0.9,0.95,1.0,1.0,0.92,0.88,0.82,0.95];

        var data = [];
        var dayOfYear = 0;
        for(var m=0;m<12;m++){
            for(var d=0;d<monthDays[m];d++){
                dayOfYear++;
                var isWeekend = new Date(2026,m,d+1).getDay()%6===0;
                for(var h=0;h<24;h++){
                    var hourFactor;
                    if(h>=9&&h<=17) hourFactor=1.0;
                    else if(h>=7&&h<=20) hourFactor=0.65;
                    else if(h>=22||h<=4) hourFactor=0.15;
                    else hourFactor=0.4;
                    var weekendFactor = isWeekend?0.55:1.0;
                    var base = 80*seasonFactor[m]*hourFactor*weekendFactor;
                    var val = Math.round(base*(0.8+Math.random()*0.4));
                    data.push([dayOfYear,h,val]);
                }
            }
        }

        chart.setOption({
            title:{text:'AI访问时段分布',left:'center',top:5,textStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:14,fontWeight:600}},
            tooltip:{
                formatter:function(p){
                    var doy=p.value[0],hr=p.value[1],v=p.value[2];
                    var cumDays=0,m=0;
                    for(var i=0;i<12;i++){cumDays+=monthDays[i];if(doy<=cumDays){m=i;break;}}
                    var dayInM=doy-(cumDays-monthDays[m]);
                    return (m+1)+'月'+dayInM+'日 '+hr+':00<br/>访问量: '+v+' 万';
                },
                backgroundColor:c.bgc,borderColor:c.brd,textStyle:{color:c.text,fontFamily:'Manrope, sans-serif'}
            },
            visualMap:{
                min:5,max:90,calculable:true,
                orient:'horizontal',left:'center',bottom:0,
                textStyle:{color:c.tm,fontFamily:'Manrope, sans-serif'},
                inRange:{color:['#313695','#4575b4','#74add1','#abd9e9','#fee090','#fdae61','#f46d43','#d73027']},
                seriesIndex:0,
                dimension:2
            },
            xAxis3D:{
                type:'value',name:'日期',min:1,max:365,
                nameTextStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:11},
                axisLabel:{
                    color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:9,
                    formatter:function(v){
                        var cum=0;
                        for(var i=0;i<12;i++){cum+=monthDays[i];if(v<=cum)return monthNames[i];}
                        return '';
                    }
                },
                axisLine:{lineStyle:{color:c.brd}},
                splitLine:{lineStyle:{color:c.brd+'20'},show:true,interval:30}
            },
            yAxis3D:{
                type:'value',name:'时刻',min:0,max:23,
                nameTextStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:11},
                axisLabel:{color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:9,formatter:function(v){return v+':00';}},
                axisLine:{lineStyle:{color:c.brd}},
                splitLine:{lineStyle:{color:c.brd+'20'},show:true,interval:6}
            },
            zAxis3D:{
                type:'value',name:'访问量(万)',
                nameTextStyle:{color:c.ts,fontFamily:'Manrope, sans-serif',fontSize:11},
                axisLabel:{color:c.tm,fontFamily:'Manrope, sans-serif',fontSize:10},
                axisLine:{lineStyle:{color:c.brd}},
                splitLine:{lineStyle:{color:c.brd+'20'}}
            },
            grid3D:{
                boxWidth:200,boxDepth:60,boxHeight:50,
                viewControl:{distance:260,alpha:18,beta:-30,autoRotate:true,autoRotateSpeed:3},
                light:{main:{intensity:1.2,shadow:false},ambient:{intensity:0.5}},
                axisLine:{lineStyle:{color:c.brd}},
                axisPointer:{lineStyle:{color:c.pri}},
                environment:'auto'
            },
            series:[{
                type:'scatter3D',
                data:data,
                symbolSize:2.5,
                label:{show:false},
                itemStyle:{opacity:0.7,borderWidth:0},
                emphasis:{
                    itemStyle:{color:c.pri,opacity:1},
                    label:{show:true,formatter:function(p){return p.value[2]+'万';},textStyle:{color:c.text,fontFamily:'Manrope, sans-serif',fontSize:11}}
                },
                animationDuration:2000,
                animationDurationUpdate:500
            }]
        });
        window.addEventListener('resize',function(){chart.resize();});
    }

    function startDynamicUpdate() {
        setInterval(function(){
            if(charts.rank){
                var newVals = [412,387,298,245,198,167,156,134,128,112].map(function(v){
                    return Math.round(v*(0.95+Math.random()*0.1));
                });
                var cities = ['北京市','上海市','广东省','浙江省','四川省','湖北省','江苏省','陕西省','重庆市','湖南省'];
                cities.reverse(); newVals.reverse();
                charts.rank.setOption({yAxis:{data:cities},series:[{data:newVals}]});
            }
        },4000);

        setInterval(function(){
            var kpis = document.querySelectorAll('.dash-kpi-value');
            kpis.forEach(function(el){
                var base = parseFloat(el.getAttribute('data-target'));
                var isInt = base > 100;
                var delta = (Math.random()-0.4)*base*0.02;
                var newVal = base + delta;
                el.textContent = isInt ? Math.round(newVal) : newVal.toFixed(2);
            });
        },5000);
    }

    var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                initDashboard();
                observer.unobserve(entry.target);
            }
        });
    },{threshold:0.1});

    var dashSection = document.getElementById('dashboard');
    if(dashSection) observer.observe(dashSection);
})();