// ********************************************************************************************
// グローバル変数
// ********************************************************************************************
const G = {
    pokeUrl       : "https://pokeapi.co/api/v2/pokemon/",
    nameUrl       : "https://pokeapi.co/api/v2/pokemon-species/",
    pokeGen       : "https://pokeapi.co/api/v2/generation",
    pokeName_ja   :"",
    pokeName_en   :"",
    pokeTypeArray :[],
    pokeTypes     :[],
    genera        :"",
    pokeOimg      :"",
    pokeDimg      :"",
    selectVersion :"",
    uid:"",
    selectList :[],
    random:0,
    remainBall :5
}

const bgc = {
    ノーマル:"#f6efe0",
    かくとう:"#EAC2AA",
    ひこう:"#9CCCEC",
    どく:"#b787a5",
    じめん:"#9C7C63",
    いわ:"#D4CCC4",
    むし:"#9FBE64",
    ゴースト:"#2E3C47",
    はがね:"#84898A",
    ほのお:"#ff9b7b",
    みず:"#B7D5F7",
    くさ:"#a5bba5",
    でんき:"#fff59d",
    エスパー:"#a3a7cb",
    こおり:"#E1EBFC",
    ドラゴン:"#D37B7E",
    あく:"#394751",
    フェアリー:"#F9D2C6",
    ダーク:"#2D3D48",
}
const list = [];
let JSONlist =""

// *********************************************初期セット***********************************************//
function initialList(uid,db){
    $.get(G.pokeGen, function(data){
    
        for(let i =0; i < data.count; i++){
            const genName = data.results[i].name;
            const genUrl = data.results[i].url;
            const dbRef = ref(db, `users/${uid}/quizlist/${genName}`);
            set(dbRef, "");

            $.get(genUrl).then(function(genData){
                
                genData.pokemon_species.forEach((element) => {    
                    
                    const slice = element.url.split("/")
                    const pokeID = slice[slice.length-2]
                    
                    list.push(pokeID)                         
                });

                JSONlist = JSON.stringify(list)
                set(dbRef,JSONlist)
                list.length =0;

            })                 
        }                
    })
    
}
function initialpokeIndex(uid,db){
    $.get(G.nameUrl, function(data){
        const len = data.count;
    
        for(let i =1; i<len; i++){
            
            const dbRef = ref(db, `users/${uid}/pokeIndex/${i}`);
            const indexValue ={
                visible:false,
                name_ja:"",
                name_en:"",
                Oimg   :"",
                type   :"",
            }
            set(dbRef, indexValue)
        }
    }) 
}    


// ********************************************************************************************
// Firebase初期設定
// ********************************************************************************************
    import { initializeApp } 
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signOut, onAuthStateChanged,} 
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
    import { getDatabase, ref, set, get } 
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBH_FU4jxXIZILNeEy7_q9UZW7PsbX9H6M",//API key削除
        authDomain: "pokequiz-68893.firebaseapp.com",
        projectId: "pokequiz-68893",
        storageBucket: "pokequiz-68893.appspot.com",
        messagingSenderId: "88509008074",
        appId: "1:88509008074:web:292ba3a59f3db6b702cc33"
    };


    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // db
    const db = getDatabase(app);

    // Google Auth認証用
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/contacts.readonly");
    const auth = getAuth();

// ********************************************************************************************
// Firebase関数
// ********************************************************************************************

    function redirect(){
        location.href = "login.html"
    }

// ********************************************************************************************
// Firebase処理
// ********************************************************************************************
// loginしていれば処理
    onAuthStateChanged(auth, (user)=>{
        if(user){

            G.uid = user.uid;
            const initialref = ref(db,`users/${G.uid}`)
            // 初回ログイン=uidに紐づくデータがない場合、初期セット実行
            get(initialref).then((initial)=>{
                if(initial.val() == null){
                    initialList(G.uid,db);
                    initialpokeIndex(G.uid,db)
                }           
            })
        }else{
            redirect();
        }

        // logOut処理
        $("#logout").on("click", function(){
            signOut(auth).then(()=>{
                redirect();
            }).catch((error)=>{
                console.log(error);
            })
        })

    })

    $("#logout").hover(function(){
        $("#logout_text").css("display", "inline")
    },function(){
        $("#logout_text").css("display", "none")
    })

// ********************************************************************************************
// ポケモンゲット処理（物理演算）
// ********************************************************************************************

function matterSet(){

    //****************************************初期設定*********************************************//
    const w = 900;
    const h = 600
    const engine = Matter.Engine.create();
    const world = engine.world;
    const balls = Matter.Composite.create();
    const ballRemain = Matter.Composite.create();
    Matter.Composite.add(world, [balls,ballRemain])
    const render = Matter.Render.create({
        element : document.getElementById("pokeget"),
        engine : engine,
        options : {
            width : w,
            height : h,
            background: '#0f0f13',
            wireframes: false,
        }
    })

    const runner = Matter.Runner.create();

    //****************************************床追加*********************************************//
    const walloptions = { 
            density :100,
            isStatic: true,
            label:"wall",
            render: {fillStyle: 'transparent'}
        };

    Matter.Composite.add(world, [
        Matter.Bodies.rectangle(w/2, h + 40, w + 2 * 40, 100.5, walloptions),
        Matter.Bodies.rectangle(w/2, -40, w + 2 * 40, 100.5, walloptions),
        Matter.Bodies.rectangle(w + 40, h/2, 100.5, h + 2 * 40, walloptions),
        Matter.Bodies.rectangle(-40, h/2, 100.5, h + 2 * 40, walloptions),
    ]);

    //****************************************マウス追加*********************************************//
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {visible: false}
        }
    });
    Matter.Composite.add(world, mouseConstraint)
    render.mouse = mouse;

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine)

    //****************************************ポケモン追加*********************************************//
    const pokemon = Matter.Bodies.rectangle(w-100,h-55,50,50,{
        label : "pokemon",
        density: 0.04,
        render:{ 
            sprite: {texture : G.pokeDimg}
        }
    });
    Matter.Composite.add(world,pokemon)

    //****************************************ボール追加*********************************************//

    const ballPos = { x:180, y:450 }
    const ballOptions = {
        label : "readyball",
        restitution: 0.3,
        density : 0.004,
        render : {
            sprite:{
                texture: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
                xScale: 1.5,
                yScale: 1.5
            }
        }
    }
    let ball = Matter.Bodies.circle(ballPos.x, ballPos.y, 8,ballOptions)

    const sling = Matter.Constraint.create({
        pointA : ballPos,
        bodyB : ball,
        stiffness:0.007,
        render:{ ancors:false }
    })

    Matter.Composite.add(balls, [ball,sling])


    //****************************************残弾ボール追加*********************************************//

    const remainPos = { x:0, y:30 };
    const offset = 50
    const remainOptions = {
        isStatic :true,
        density: 0.004,
        render: {
            sprite: {
            texture: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
                xScale: 1.5,
                yScale: 1.5
            }
        },
    }

    for(let i = 1; i < G.remainBall; i++){
        const remainball = Matter.Bodies.circle(remainPos.x + offset * i, remainPos.y, 8,remainOptions)
        Matter.Composite.add(ballRemain, remainball)
    }

    //****************************************スリングショット機能*********************************************//
    let isFry = false;
    let fryCount = G.remainBall

    Matter.Events.on(mouseConstraint,'enddrag', function(e){
        if(e.body === ball){
            isFry = true;
        }
    });

    Matter.Events.on(engine, "afterUpdate", function(e){
        const xDist = Math.abs(ball.position.x - ballPos.x );
        const yDist = Math.abs(ball.position.y - ballPos.y );

        if (isFry == true && xDist < 20 && yDist < 10) {  
            sling.pointA =null;
            sling.bodyB = null;
            ball.label = "ball";
            
            isFry = false;
            fryCount --;
        }
            

        if (fryCount >0 && ball.label == "ball" && ball.speed < 0.28) {  
        
            ball.label = "loseball";

            ball = Matter.Bodies.circle(ballPos.x, ballPos.y, 8,ballOptions);
            sling.pointA = ballPos;
            sling.bodyB = ball;
            Matter.Composite.add(balls, ball);

            const removeball = ballRemain.bodies[fryCount-1]
            Matter.Composite.remove(ballRemain, removeball);
        }

        if (fryCount == 0 && ball.label == "ball" && ball.speed < 0.28){
            
            let timer = 0

            Matter.Events.off(engine)
            Matter.Events.off(runner);
            Matter.Body.setStatic(pokemon, false);
            
            Matter.Events.on(runner, "afterTick", function(){

                timer ++;
                if(timer < 20){
                    Matter.Body.setVelocity(pokemon,{x:(w/2 - pokemon.position.x)/10, y: (h/2 - pokemon.position.y)/10});
                }else if(timer >=20 && timer < 60){
                    Matter.Body.setVelocity(pokemon,{x:(w - pokemon.position.x)/10, y: 0});
                }else if(timer == 60){
                    Matter.Composite.remove(world, pokemon);
                }else if(timer == 80){
                    $("#getfalseName").text(G.pokeName_ja);
                    $("#true_wrap").fadeOut(250);
                    $("#pokeget").empty()
                }else if(timer == 100){
                    Matter.Events.off(runner);
                    Matter.Events.off(engine);
                    Matter.Composite.clear(world);
                    $("#getfalse_effect").delay(250);
                    $("#getfalse_effect").fadeIn(250);

                    timer = 0
                }  
            })                          

          
        }

        
    });

    //****************************************ポケモンムーブ機能*********************************************//
    let timecount = 0;
    const r = Math.floor(Math.random() *3)

    if(r == 0){
        Matter.Events.on(runner, "afterTick", function(){
        
            timecount ++;
            if (timecount >= 60 * 1.5) {
                if(pokemon.position.x >=w-80){
                    Matter.Body.setVelocity(pokemon, { x: -1, y: -10 });
                    timecount = 0;
                }else if(pokemon.position.x < w/2){
                    Matter.Body.setVelocity(pokemon, { x: 1, y: -10 });
                    timecount = 0;
                }else{
                    if (Math.random() <= 0.5){
                        Matter.Body.setVelocity(pokemon, { x: 1, y: -10 });
                        timecount = 0;
                    }else{
                        Matter.Body.setVelocity(pokemon, { x: -1, y: -10 });
                        timecount = 0;
                    }
                }
            }  
        })

    }else if( r== 1){
        
        Matter.Body.setStatic(pokemon, true);
        Matter.Body.setPosition(pokemon, { x: w-200, y:100});

        Matter.Events.on(runner, "afterTick", function(){
            let px = w-250 + 200 * Math.sin(engine.timing.timestamp*0.002);
            Matter.Body.setVelocity(pokemon,{x:px - pokemon.position.x, y: 0});
            Matter.Body.setPosition(pokemon, {x:px, y:100})
        })

    }else{

        Matter.Body.setStatic(pokemon, true);
        Matter.Body.setPosition(pokemon, { x: w-200, y:h/2});

        Matter.Events.on(runner, "afterTick", function(){
            let px = w-250 + 200 * Math.sin(engine.timing.timestamp*0.002);
            let py = h/2 + 150 * Math.cos(engine.timing.timestamp*0.005);
            Matter.Body.setVelocity(pokemon,{x:px - pokemon.position.x, y: px - pokemon.position.y});
            Matter.Body.setPosition(pokemon, {x:px, y:py})
        })
    }
    //****************************************衝突判定機能*********************************************//

    Matter.Events.on(engine, "collisionStart", function(event){
        event.pairs.forEach(function(pair) {        
            if(pair.bodyA.label == "pokemon" && pair.bodyB.label == "ball"){
                const xgetPos = pokemon.position.x-50;
                const ygetPos = pokemon.position.y-50;

                Matter.Composite.remove(world, [pokemon,balls,ballRemain]);
                setTimeout(() => {
                    Matter.Composite.remove(world, balls);
                }, 500);
                
                const getEffect = Matter.Bodies.rectangle(xgetPos, ygetPos, 20, 20, {
                    isStatic:true,
                    render: {
                        sprite: {texture: "./img/geteffect.png",}
                    }
                });

                Matter.Composite.add(engine.world, getEffect);
                
                setTimeout(() => {
                    Matter.Composite.remove(engine.world, getEffect);
                    const get =  Matter.Bodies.circle(xgetPos, ygetPos, 7.5,ballOptions);
                    Matter.Composite.add(engine.world, get);
                }, 250);

                // ************ゲットエフェクト設定***********//
                $("#getName").text(G.pokeName_ja);
                $("#getPokeID").text(`ID:${G.selectList[G.random]}`);
                $("#getPokeName").text(G.pokeName_ja);
                $("#getPokeImg").html(`<img src="${G.pokeOimg}">`);
                $("#getPokeType").text(`タイプ：${G.pokeTypes}`);

                $("#poke_card").css("background-color","")
                $("#poke_card").css("background","")

                if(G.pokeTypes.length == 1 ){
                    
                    const applyColor = bgc[G.pokeTypes[0]]
                    $("#poke_card").css("background-color",applyColor)

                }else if(G.pokeTypes.length == 2){
                    const applyColor1 = bgc[G.pokeTypes[0]];
                    const applyColor2 = bgc[G.pokeTypes[1]];

                    $("#poke_card").css("background",
                        `linear-gradient(45deg, ${applyColor1} 0%, ${applyColor2} 100%)`
                    )
                }

                $("#true_wrap").fadeOut(1000);
                $("#get_effect").delay(1000);
                $("#get_effect").fadeIn(1000);

                // ************G変数リセット***********//

                const getID = G.selectList[G.random];
                const JSONtype = JSON.stringify(G.pokeTypes);

                G.selectList.splice(G.random,1)
                

                // ************Firebase更新***********//
                const setQuizList = ref(db, `users/${G.uid}/quizlist/${G.selectVersion}`);
                const setIndex = ref(db, `users/${G.uid}/pokeIndex/${getID}`)
                const JSONupdate = JSON.stringify(G.selectList);
                
                const indexUpdate = {
                    visible:true,
                    name_ja:G.pokeName_ja,
                    name_en:G.pokeName_en,
                    Oimg   :G.pokeOimg,
                    type   :JSONtype,
                }

                set(setQuizList,JSONupdate);
                set(setIndex,indexUpdate)

                // ************matter 終了処理***********//
                setTimeout(()=>{
                    
                    Matter.Events.off(runner);
                    Matter.Events.off(engine);
                    
                    Matter.Composite.clear(world);
                    $("#pokeget").empty()

                }, 1500)
            }
        })
    });
}

// ********************************************************************************************
// 名前クイズ関数
// ********************************************************************************************

//********************************** pokeAPIからクイズ取得**************************************//
function getAPI(){
    G.random = Math.ceil(Math.random() * G.selectList.length)
    $.get(`${G.nameUrl}${G.selectList[G.random]}/`, function(pokeName){
        G.pokeName_ja = pokeName.names[0].name;
        G.pokeName_en = pokeName.names[8].name;
        G.genera      = pokeName.genera[0].genus;

    })

    $.get(`${G.pokeUrl}${G.selectList[G.random]}/`,function(pokeDetail){
        G.pokeOimg = pokeDetail.sprites.other["official-artwork"].front_default;
        G.pokeDimg =  pokeDetail.sprites.front_default;
        $(`#quiz_img`).html(`<img src="${G.pokeOimg}" id="pokeOimg" style="filter: blur(15px)">`);
        G.pokeTypeArray = pokeDetail.types;
        G.pokeTypeArray.forEach((array)=>{
            $.get(`${array.type.url}`, function(typeData){
                G.pokeTypes.push(typeData.names[0].name);
            })
        })
    })
}
//********************************** FireBaseからクイズリスト取得**************************************//
function pokeNamequiz(){
    const dbRef = ref(db, `users/${G.uid}/quizlist/${G.selectVersion}`)
    get(dbRef).then(async (snapshot)=>{
        const JSONList = await snapshot.val();
        G.selectList = await JSON.parse(JSONList)

        getAPI();//pokeAPIからクイズ取得機能へ
    });
}
//********************************** 正誤判定**************************************//
function judge(){
    if($("#answer_val").val() ==G.pokeName_ja){

        $("#true_wrap").delay(250);
        $("#true_wrap").fadeIn(250);
        resetHint();
        matterSet();//物理処理機能へ
        
    }else{

        $("#correct_name").text(G.pokeName_ja)
        $("#false_wrap").delay(250);
        $("#false_wrap").fadeIn(250);
        resetHint(); 
        resetG();
    
    }
}
//********************************** ヒント表示**************************************//
function displayHint(){
    const val = this.getAttribute('value');
    if(val == 1){
        $("#hint_1").text(`英語だと${G.pokeName_en}だよ`);
        $("#pokeOimg").css("filter","blur(10px)");
        $("#hint_2btn").css("display", "inline");
        $("#hint_1btn").css("display", "none");

        G.remainBall = 4

    } else if(val == 2){
        $("#hint_2").text(`これは『${G.genera}』だよ`);
        $("#pokeOimg").css("filter","blur(5px)");
        $("#hint_2btn").css("display", "none");
        $("#hint_3btn").css("display", "inline");

        G.remainBall = 3

    }else if(val == 3){
        $("#hint_3").text(`最初の文字は『${G.pokeName_ja.slice(0,1)}』だよ`);
        $("#pokeOimg").css("filter","blur(0px)");
        $("#hint_3btn").css("display", "none");

        G.remainBall = 2

    }
}

//********************************** ヒントリセット**************************************//
function resetHint(){
    $("#hint_1btn").css("display", "inline");
    $("#hint_2btn").css("display", "none");
    $("#hint_3btn").css("display", "none");
    $("#hint_1").text("");
    $("#hint_2").text("");
    $("#hint_3").text("");
}

//********************************** G関数の配列等リセット*************************************//
function resetG(){
    G.pokeTypeArray.length = 0;
    G.pokeTypes.length = 0;
    G.remainBall = 5;

}
//********************************** 画面切り替え*************************************//
function displaychange(fadeOut_display, fadeIn_display){
    $(fadeOut_display).fadeOut(250);
    $(fadeIn_display).delay(250);
    $(fadeIn_display).fadeIn(250);
}


// ********************************************************************************************
// 処理
// ********************************************************************************************


$("#quiz_btn").on("click", function (){
    displaychange("#home","#version_select")
})

$("#red_green,#gold_silver,#ruby_saphia,#diamond_parl,#black_white,#x_y,#sun_moon,#sord_shield").on("click",function(){
    $("#version").val($(this).attr("name"))
})


$("#version_send").on("click", function(){
    G.selectVersion =$("#version").val();

    displaychange("#version_select", "#pokequiz")
    pokeNamequiz();
})


$("#hint_1btn").on("click", displayHint);
$("#hint_2btn").on("click", displayHint);
$("#hint_3btn").on("click", displayHint);

$("#answer").on("click", function(){

    judge();
    $("#pokequiz").fadeOut(250);
    $("#answer_val").val("").blur()
    
});

//**********************************各画面から次の問題へ*************************************//
$("#get_next").on("click", function(){  

    resetG();
    pokeNamequiz();
    displaychange("#get_effect", "#pokequiz")
    
})

$("#false_next").on("click", function(){

    resetG();
    pokeNamequiz();
    displaychange("#false_wrap", "#pokequiz")

})

$("#getfalse_next").on("click", function(){

    resetG();
    pokeNamequiz();
    displaychange("#getfalse_effect", "#pokequiz")

})

//**********************************各画面からホームへ*************************************//
$("#get_backHome").on("click", function(){
   
    resetG();
    displaychange("#get_effect", "#home")
    
})

$("#false_backHome").on("click", function(){
   
    resetG();
    displaychange("#false_wrap", "#home")

})

$("#getfalse_backHome").on("click", function(){
    
    resetG();
    displaychange("#getfalse_effect", "#home")

})

//**********************************図鑑表示*************************************//
$("#index_btn").on("click", function(){
    
    displaychange("#home", "#index_area");
    $("#backHome").delay(250);
    $("#backHome").fadeIn(250);

    const dbRef = ref(db, `users/${G.uid}/pokeIndex`)
    get(dbRef).then((snapshot)=>{
        const data = snapshot.val();
        let indexCards ="";
        let i = 0
        data.forEach((poke)=>{
         
            i ++;
          
           if (poke.visible == false) {
                indexCards += `<div class="indexCards invisible">
                    <div class="indexID">ID:${i}</div>
                    <div class="indexImg">?</div>
            
                </div>`
            } else{
                const type = JSON.parse(poke.type)
                if(type.length == 1 ){
                    
                    const applyColor = bgc[type[0]]
                    const applyStyle = `"background-color:${applyColor}"`

                    indexCards += ` <div class="indexCards visible" style=${applyStyle}>
                        <div class="indexID">ID:${i}</div>
                        <div class="indexName">${poke.name_ja}</div>
                        <div class="indexImg"><img src="${poke.Oimg}"></div>
                        <div class="indexType">${type}</div>
                    </div>`
                    
                }else if(type.length == 2){
                    const applyColor1 = bgc[type[0]];
                    const applyColor2 = bgc[type[1]];
    
                    const applyStyle =`"background:
                        linear-gradient(45deg, ${applyColor1} 0%, ${applyColor2} 100%)"
                    `
                    indexCards += ` <div class="indexCards visible" style=${applyStyle}>
                        <div class="indexID">ID:${i}</div>
                        <div class="indexName">${poke.name_ja}</div>
                        <div class="indexImg"><img src="${poke.Oimg}"></div>
                        <div class="indexType">${type}</div>
                    </div>`
                }
            }

        })
        $("#index").html(indexCards)
    })
})

//**********************************図鑑からホームに戻る*************************************//
$("#backHome").on("click", function(){
    $("#index").empty();
    displaychange("#index_area","#home");
    $("#backHome").fadeOut(250);
})

