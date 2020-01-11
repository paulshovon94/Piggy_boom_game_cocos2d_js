//golbal variables
var space;
var angle = 0;
var size;
var shapeArray = [];
var bird;
var birdPhysics;
var startTouchX;
var startTouchY;
var endTouchX;
var endTouchY;
var birdIndex;
var birdPositionX;
var birdPositionY;
var enemySpriteArray = new Array();
//var sprite_target_physics_array = new Array();
var enemyKilled = 0;
var catapultRope;
var touched = false;
var missed = 0;
var enemyMissed1, enemyMissed2, enemyMissed3;
var deviceScaleFloat = 1;
//wall
var WALLS_WIDTH = 5;
var WALLS_ELASTICITY = 0.5;
var WALLS_FRICTION = 1;


var HelloWorldLayer = cc.Layer.extend({
    sprite: null,

    //constructor
    ctor: function () {
        // 1. super init first
        this._super();
        mainPanel = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded
        }, this);
        this.init();
        return true;
    },
    //init function
    init: function () {
        this._super();
        size = cc.winSize;
        cc.log("width: " + size.width);
        cc.log("height: " + size.height);
        //initPhysics function called
        this.initPhysics();
        //
        this.addWallsAndGround();
        //loadGameField function called
        this.loadGameField();
        //loadEnemy function called
        this.loadEnemy();
        //loadMissedEnemy function called
        this.loadMissedEnemy();
        //calling Update function
        this.scheduleUpdate();
        //calling setDefaultCollisionHandler
        this.space.setDefaultCollisionHandler(this.collisionBegin, null, null, null);
    },
    //loadGameField function
    loadGameField: function () {
        //loading  background
        sprite_bg = new cc.Sprite(res.Background);
        sprite_bg.setAnchorPoint(cc.p(0.5, 0.5));
        sprite_bg.setPosition(cc.p(size.width / 2, size.height / 2));
        var width_ratio = size.width / sprite_bg.getContentSize().width;
        var height_ratio = size.height / sprite_bg.getContentSize().height;
        sprite_bg.setScaleX(width_ratio);
        sprite_bg.setScaleY(height_ratio);
        this.addChild(sprite_bg, 0);
        //loading angry bird
        bird = new cc.Sprite(res.Bird);
        bird.setAnchorPoint(cc.p(0.5, 0.5));
        birdPositionX = size.width / 2;
        birdPositionY = size.height / 4 - 50 * deviceScaleFloat;
        bird.setPosition(cc.p(birdPositionX, birdPositionY));
        bird.setScale(0.4);
        //this.addChild(bird, 1);
        //calling addPhysicsBodyForBird function
        this.addPhysicsBodyForBird(bird, birdPositionX, birdPositionY, true, res.Bird, "circle", 0.5);
        //loading catapult
        var catapult = new cc.Sprite(res.Catapult);
        catapult.setAnchorPoint(cc.p(0.5, 0.5));
        var catapultPositionX = size.width / 2;
        var catapultPositionY = size.height / 4 - 140 * deviceScaleFloat;
        catapult.setPosition(cc.p(catapultPositionX, catapultPositionY));
        catapult.setScale(0.7 * deviceScaleFloat);
        this.addChild(catapult, 0);
        //loading catapult rope 
        catapultRope = new cc.Sprite(res.Rope);
        catapultRope.setAnchorPoint(cc.p(0.5, 0.5));
        catapultPositionX = size.width / 2;
        catapultPositionY = size.height / 4 - 140 * deviceScaleFloat;
        catapultRope.setPosition(cc.p(catapultPositionX, catapultPositionY));
        catapultRope.setScale(0.7 * deviceScaleFloat);
        this.addChild(catapultRope, 2);
    },

    //loadEnemy function
    loadEnemy: function () {
        var enemyNumber = 5;
        var posX, posY;
        for (var i = 0; i < enemyNumber; i++) {
            enemySpriteArray[i] = new cc.Sprite(res.Target);
            if (i == 0) {
                //posX = size.width / 2 - 200 * deviceScaleFloat;
                posX = Math.round(this.getRandom(30, size.width / 2 - 30));
                posY = size.height / 2;
            }
            else if (i == 1) {
                //posX = size.width / 2 + 200 * deviceScaleFloat;
                posX = Math.round(this.getRandom(size.width / 2 + 30, size.width - 30));
                posY = size.height / 2;
            }
            else if (i == 2) {
                //posX = size.width / 2 - 200 * deviceScaleFloat;
                posX = Math.round(this.getRandom(30, size.width / 2 - 30));
                posY = size.height / 2 + 150 * deviceScaleFloat;
            }
            else if (i == 3) {
                //posX = size.width / 2 + 200 * deviceScaleFloat;
                posX = Math.round(this.getRandom(size.width / 2 + 30, size.width - 30));
                posY = size.height / 2 + 150 * deviceScaleFloat;
            }
            else if (i == 4) {
                //posX = size.width / 2;
                posX = Math.round(this.getRandom(30, size.width - 30));
                posY = size.height / 2 + 250 * deviceScaleFloat;
            }
            enemySpriteArray[i].setPosition(cc.p(posX, posY));
            enemySpriteArray[i].setScale(0.5 * deviceScaleFloat);
            //calling addPhysicsBodyForEnemy
            this.addPhysicsBodyForEnemy(enemySpriteArray[i], posX, posY, true, res.Target, "target", 0.4, i);
        }
    },

    //random function
    getRandom: function (min, max) {
        return Math.random() * (max - min) + min;
    },

    //loadMissedEnemy function
    loadMissedEnemy: function () {
        //enemyMissed1 = StorePanel.createSprite(targetImgSrc, targetImgKey);
        enemyMissed1 = new cc.Sprite(res.Life);
        enemyMissed1.setAnchorPoint(cc.p(0.5, 0.5));
        enemyMissed1.setScale(0.20 * deviceScaleFloat);
        //var posMissedX1 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * deviceScaleFloat;
        var posMissedX1 = size.width - 80 * deviceScaleFloat;
        var posMissedY1 = size.height - 60 * deviceScaleFloat;
        enemyMissed1.setPosition(cc.p(posMissedX1, posMissedY1));
        this.addChild(enemyMissed1, 2);

        //enemyMissed2 = StorePanel.createSprite(targetImgSrc, targetImgKey);
        enemyMissed2 = new cc.Sprite(res.Life);
        enemyMissed2.setAnchorPoint(cc.p(0.5, 0.5));
        enemyMissed2.setScale(0.20 * deviceScaleFloat);
        //var posMissedX2 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * deviceScaleFloat;
        var posMissedX2 = size.width - 80 * deviceScaleFloat;
        var posMissedY2 = size.height - 120 * deviceScaleFloat;
        enemyMissed2.setPosition(cc.p(posMissedX2, posMissedY2));
        this.addChild(enemyMissed2, 2);

        //enemyMissed3 = StorePanel.createSprite(targetImgSrc, targetImgKey);
        enemyMissed3 = new cc.Sprite(res.Life);
        enemyMissed3.setAnchorPoint(cc.p(0.5, 0.5));
        enemyMissed3.setScale(0.20 * deviceScaleFloat);
        //var posMissedX3 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * deviceScaleFloat;
        var posMissedX3 = size.width - 80 * deviceScaleFloat;
        var posMissedY3 = size.height - 180 * deviceScaleFloat;
        enemyMissed3.setPosition(cc.p(posMissedX3, posMissedY3));
        this.addChild(enemyMissed3, 2);

    },

    //initPhysics
    initPhysics: function () {
        this.space = new cp.Space();
        this.space.gravity = cp.v(0.0, 0.0);
    },

    //addWallsAndGround function
    addWallsAndGround : function() {
        leftWall = new cp.SegmentShape(mainPanel.space.staticBody, new cp.v(0, 0), new cp.v(0, size.height), WALLS_WIDTH);
        leftWall.setElasticity(WALLS_ELASTICITY);
        leftWall.setFriction(WALLS_FRICTION);
        mainPanel.space.addStaticShape(leftWall);
     
        rightWall = new cp.SegmentShape(mainPanel.space.staticBody, new cp.v(size.width, size.height), new cp.v(size.width, 0), WALLS_WIDTH);
        rightWall.setElasticity(WALLS_ELASTICITY);
        rightWall.setFriction(WALLS_FRICTION);
        mainPanel.space.addStaticShape(rightWall);
     
        bottomWall = new cp.SegmentShape(mainPanel.space.staticBody, new cp.v(0, 0), new cp.v(size.width, 0), WALLS_WIDTH);
        bottomWall.setElasticity(WALLS_ELASTICITY);
        bottomWall.setFriction(WALLS_FRICTION);
        mainPanel.space.addStaticShape(bottomWall);
     
        upperWall = new cp.SegmentShape(mainPanel.space.staticBody, new cp.v(0, size.height), new cp.v(size.width, size.height), WALLS_WIDTH);
        upperWall.setElasticity(WALLS_ELASTICITY);
        upperWall.setFriction(WALLS_FRICTION);
        mainPanel.space.addStaticShape(upperWall);
    },

    //addPhysicsBodyForBird function
    addPhysicsBodyForBird: function (bodySprite, posX, posY, isDynamic, spriteImageSrc, type, scaleFactor) {
        birdPhysics = new cc.PhysicsSprite(spriteImageSrc);
        birdPhysics.setAnchorPoint(cc.p(0.5, 0.5));
        birdPhysics.setScale(scaleFactor * deviceScaleFloat);
        this.addChild(birdPhysics, 1);

        var width = bodySprite.getContentSize().width * bodySprite.getScaleX();
        var height = bodySprite.getContentSize().height * bodySprite.getScaleY();

        if (isDynamic) {
            var body = new cp.Body(1, cp.momentForBox(1, width, height));
            if (type == "circle") {
                var body = new cp.Body(1, cp.momentForCircle(1, 0, width * 0.25, cc.p(0, 0)));
            }
        }
        else {
            var body = new cp.Body(Infinity, Infinity);
        }
        body.setPos(cp.v(posX, posY));
        if (isDynamic) {
            this.space.addBody(body);
        }
        //adding shape
        var shape = new cp.BoxShape(body, width, height);
        if (type == "circle") {
            var shape = new cp.CircleShape(body, width * 0.25, cc.p(0, 0));
        }
        shape.setFriction(1);
        shape.setElasticity(0.5);
        shape.name = type;
        //Putting image of the sprite in the shape
        shape.image = bodySprite;
        this.space.addShape(shape);
        shapeArray.push(shape);
        birdPhysics.setBody(body);
    },

    //addPhysicsBodyForEnemy function called
    addPhysicsBodyForEnemy: function (bodySprite, posX, posY, isDynamic, spriteImageSrc, type, scaleFactor, enemyNumber) {
        enemySpriteArray[enemyNumber] = new cc.PhysicsSprite(spriteImageSrc);
        enemySpriteArray[enemyNumber].setAnchorPoint(cc.p(0.5, 0.5));
        enemySpriteArray[enemyNumber].setScale(scaleFactor * deviceScaleFloat);
        this.addChild(enemySpriteArray[enemyNumber], 1);

        var width = bodySprite.getContentSize().width * bodySprite.getScaleX();
        var height = bodySprite.getContentSize().height * bodySprite.getScaleY();

        if (isDynamic) {
            var body = new cp.Body(1, cp.momentForCircle(1, 0, width * .5, cc.p(0, 0)));
        }
        else {
            var body = new cp.Body(Infinity, Infinity);
        }
        body.setPos(cp.v(posX, posY));
        if (isDynamic) {
            this.space.addBody(body);
        }
        //adding shape
        var shape = new cp.CircleShape(body, width * 0.5, cc.p(0, 0));
        shape.setFriction(1);
        shape.setElasticity(0.5);
        //   shape.setCollisionType(0);
        shape.name = type;
        //Putting image of the sprite in the shape
        shape.image = bodySprite;
        shape.tag = enemyNumber;
        this.space.addShape(shape);
        shapeArray.push(shape);
        enemySpriteArray[enemyNumber].setBody(body);

        var enemySpriteJump = cc.JumpTo.create(2, cc.p(enemySpriteArray[enemyNumber].getPositionX(), enemySpriteArray[enemyNumber].getPositionY()), 5, 3);
        // enemySpriteArray[enemyNumber].runAction(enemySpriteJump);
        var repeat_action = cc.RepeatForever.create(enemySpriteJump);
        enemySpriteArray[enemyNumber].runAction(repeat_action);
    },

    //Update function
    update: function (dt) {
        this.space.step(dt);

        //We loop through our custom variable, shapeArray, and update each shape image according to its body position and rotation
        for (var i = shapeArray.length - 1; i >= 0; i--) {
            shapeArray[i].image.x = shapeArray[i].body.p.x
            shapeArray[i].image.y = shapeArray[i].body.p.y
            var angle = Math.atan2(-shapeArray[i].body.rot.y, shapeArray[i].body.rot.x);
            shapeArray[i].image.rotation = angle * 57.2957795;
            //shapeArray[i].image.rotation = angle * 1;
        }

        //Set the bird in orginal position after movement
        var bgStartPos = size.width / 2 - sprite_bg.getContentSize().width / 2 * sprite_bg.getScaleX();
        var bgEndPos = size.width / 2 + sprite_bg.getContentSize().width / 2 * sprite_bg.getScaleX();

        if (birdPhysics.getPositionX() < bgStartPos || birdPhysics.getPositionX() > bgEndPos || birdPhysics.getPositionY() > size.height) {

            this.scheduleOnce(this.setInOrgPos, 0.75);
        }

        //finding if all enemy are killed
        if (enemyKilled == 5) {
            cc.log("Game end");
            this.removingAll("You Won");
        }

        //updating the missed image after each shot is missed and ending game after all missed
        if (missed == 3) {
            this.removeChild(enemyMissed1);
            this.removingAll("You Lost");
        }

        if (missed == 2) {
            this.removeChild(enemyMissed2);
        }

        if (missed == 1) {
            this.removeChild(enemyMissed3);
        }

    },

    //setInOrgPos function
    setInOrgPos: function () {

        birdPhysics.setPosition(cp.v(birdPositionX, birdPositionY));
        birdPhysics.body.vx = 0;
        birdPhysics.body.vy = 0;
        missed++;
        //cc.log("missed " + missed);
    },

    //removingAll function called
    removingAll: function (text) {

        this.unscheduleUpdate();
        this.removeAllChildren(true);
        this.showEndGame(text);

    },

    //showEndGame function
    showEndGame: function (text) {
        var label = new cc.LabelTTF(text, 'Times New Roman', 200 * deviceScaleFloat);
        label.setPosition(cc.p(size.width / 2, size.height / 2));
        label.setColor(cc.color(255, 111, 97));
        this.addChild(label, 4);
    },

    //collisionBegin function
    collisionBegin: function (arbiter, space) {
        if ((arbiter.a.name == "circle" && arbiter.b.name == "target") || (arbiter.b.name == "target" && arbiter.a.name == "circle")) {
            cc.log("collided");
            enemyKilled++;
            arbiter.a.body.vx = 0;
            arbiter.a.body.vy = 0;

            var arrayShapes = arbiter.getShapes();
            var bodyAsteroid = arrayShapes[1].body;

            //removing physicSprite
            var target_no = arrayShapes[1].tag;
            mainPanel.removeChild(enemySpriteArray[target_no]);
            //removing body and shape                   
            space.addPostStepCallback(function () {
                space.removeBody(bodyAsteroid);
                space.removeShape(arrayShapes[1]);
            });

            //setting the position of the bird to original
            birdPhysics.setPosition(cp.v(birdPositionX, birdPositionY));

        }

    },

    //oNTouchBegan
    onTouchBegan: function (touch, event) {

        cc.log("Touch begin");
        for (var i = shapeArray.length - 1; i >= 0; i--) {
            if (shapeArray[i].pointQuery(cp.v(touch.getLocation().x, touch.getLocation().y)) != undefined) {
                if (shapeArray[i].name == "circle") {
                    birdIndex = i;
                    startTouchX = shapeArray[i].body.p.x;
                    startTouchY = shapeArray[i].body.p.y;

                    cc.log("startTouch X--" + startTouchX);
                    cc.log("startTouch Y-- " + startTouchY);
                    touched = true;

                }
            }
        }
        return true;
    },

    onTouchMoved: function (touch, event) {

        cc.log("Touch Moved");
        for (var i = shapeArray.length - 1; i >= 0; i--) {
            if (shapeArray[i].pointQuery(cp.v(touch.getLocation().x, touch.getLocation().y)) != undefined) {
                if (shapeArray[i].name == "circle") {
                    //move the shape
                    var birdWidth = birdPhysics.getContentSize().width * birdPhysics.getScale();
                    if (touch.getLocation().x > birdWidth / 2 && touch.getLocation().x < size.width - birdWidth / 2) {
                        shapeArray[i].body.p.x = touch.getLocation().x;
                    }
                    if (touch.getLocation().y > (birdPhysics.getContentSize().height * birdPhysics.getScale()) / 2 && touch.getLocation().y < shapeArray[i].body.p.y) {
                        shapeArray[i].body.p.y = touch.getLocation().y;

                    }

                }
            }
        }

    },

    onTouchEnded: function (touch, event) {

        cc.log("Touch end");
        if (touched == true) {
            endTouchX = touch.getLocation().x;
            endTouchY = touch.getLocation().y;
            cc.log("endTouchX--" + endTouchX);
            cc.log("endTouchY--" + endTouchY);
            var distanceX = startTouchX - endTouchX;
            var distanceY = startTouchY - endTouchY;
            cc.log("distanceX  " + distanceX);
            cc.log("distanceY  " + distanceY);

            if (distanceY >= 20) {
                birdPhysics.body.applyImpulse(cp.v(distanceX * 9, distanceY * 9), cp.v(0, 0));
            }
            else {
                shapeArray[birdIndex].body.p.x = birdPositionX;
                shapeArray[birdIndex].body.p.y = birdPositionY;
            }
            touched = false;
        }
        birdPhysics.setPosition(cp.v(birdPositionX, birdPositionY));

    },

});




var HelloWorldScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

