
<canvas id="gameCanvas" width="800" height="450" style="background-color:black;"></canvas>
    <script type="text/javascript">
        window.onload = function(){
            cc.game.onStart = function () {
                //load resources
                var sys = cc.sys;
                if (!sys.isNative && document.getElementById("cocosLoading")) //If referenced loading.js, please remove it
                    document.body.removeChild(document.getElementById("cocosLoading"));

                // Pass true to enable retina display, on Android disabled by default to improve performance
                cc.view.enableRetina(sys.os === sys.OS_IOS ? true : true);

                // Disable auto full screen on baidu and wechat, you might also want to eliminate sys.BROWSER_TYPE_MOBILE_QQ
                if (sys.isMobile &&
                    sys.browserType !== sys.BROWSER_TYPE_BAIDU &&
                    sys.browserType !== sys.BROWSER_TYPE_WECHAT) {
                    cc.view.enableAutoFullScreen(true);
                }

                // Adjust viewport meta
                cc.view.adjustViewPort(true);

                // Uncomment the following line to set a fixed orientation for your game
                cc.view.setOrientation(cc.ORIENTATION_PORTRAIT);

                // Setup the resolution policy and design resolution size
                //cc.view.setDesignResolutionSize(640, 1136, cc.ResolutionPolicy.SHOW_ALL);

                var rectSize = cc.view.getFrameSize();
                cc.view.setDesignResolutionSize(rectSize.width, rectSize.height, cc.ResolutionPolicy.SHOW_ALL);


                var gamePlayBgImgSrc = "";
                var gamePlayBgImgKey = "gamePlayBgImgKey";

                var circleImgSrc = "";
                var circleImgKey = "circleImgKey";

                var knifeImgSrc = "";
                var knifeImgKey = "knifeImgKey";

                var fruitImgSrc = "";
                var fruitImgKey = "fruitImgKey";

                var testImgKey = "testImgKey";

                var testSoundSrc = "";
                var testSoundKey = "testSoundKey";
                const panel =
                {
                    panelGame: 1,
                    panelTest: 2
                };

                const delegateFunc =
                {
                    remove: 1
                };

                var StorePanel = cc.Layer.extend({

                    appDelegate: null,
                    isSmallWindow: false,

                    imgBackground: null,
                    btnCross: null,
                    loadingLayer: null,
                    lblTitle: null,

                    initDefaultValue: function () {
                        appDelegate = AppDelegate.sharedApplication();
                        this.isSmallWindow = false;
                    },

                    init: function () {
                        if (this._super()) {
                            this.initDefaultValue();

                            return true;
                        }
                        return false;
                    },

                    initSubClass: function () {
                        this.initDefaultValue();
                    },

                    initWithSmallWindow: function () {
                        this.initDefaultValue();
                        this.isSmallWindow = true;
                        this.setContentSize(cc.winSize);
                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                return event.getCurrentTarget().onTouchBegan(touch, event);
                            },
                            onTouchMoved: function (touch, event) {
                                //cc.log("TOUCH MOVED");
                                event.getCurrentTarget().onTouchMoved(touch, event);
                            },
                            onTouchEnded: function (touch, event) {
                                //cc.log("TOUCH ENDED");
                                event.getCurrentTarget().onTouchEnded(touch, event);
                            }
                        }, this);
                    },


                    StorePanel.cacheBase64Image = function (_imgSrc, _imgKey) {
                        var imgElement = new cc.newElement("IMG");
                        imgElement.setAttribute("src", _imgSrc);

                        cc.textureCache.cacheImage(_imgKey, imgElement);
                    }

                StorePanel.createSprite = function (_imgSrc, _imgKey) {
                        StorePanel.cacheBase64Image(_imgSrc, _imgKey);

                        var sprite = new cc.Sprite(_imgKey);
                        return sprite;
                    }
                StorePanel.createPhysicsSprite = function (_imgSrc, _imgKey) {
                        StorePanel.cacheBase64Image(_imgSrc, _imgKey);

                        var physicsSprite = new cc.PhysicsSprite.create(_imgKey);
                        return physicsSprite;
                    }
                StorePanel.createButton = function (_imgSrc, _imgKey) {
                        StorePanel.cacheBase64Image(_imgSrc, _imgKey);

                        var btn = new ccui.Button(_imgKey, _imgKey);
                        return btn;
                    }

                StorePanel.getRandomInt = function (lowerlimit, higherLimit) {
                        return Math.floor(Math.random() * Math.floor(higherLimit - lowerlimit) + lowerlimit);
                    }


                StorePanel.createLabel = function (strText, fontSize, isBold) {
                        var strFontName = "Arial";

                        var lbl = new cc.LabelTTF(strText, strFontName, fontSize);
                        lbl.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                        lbl.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
                        lbl.setColor(cc.color.BLACK);

                        return lbl;
                    }

                StorePanel.checkSpriteTouch = function (mainSprite, touchLocation) {
                        var point = mainSprite.convertToNodeSpace(touchLocation);
                        var size = mainSprite.getContentSize();

                        if (point.x > 0 && point.y > 0 && point.x < size.width && point.y < size.height)
                            return true;
                        else
                            return false;
                    }
                StorePanel.insertString = function (str, index, value) {
                        return str.substr(0, index) + value + str.substr(index);
                    }
                StorePanel.getStringCommaFormated = function (value) {
                        var returnString = value.toString();
                        var insertPosition = returnString.length - 3;

                        if (insertPosition > 0) {
                            returnString = StorePanel.insertString(returnString, insertPosition, ",");
                            insertPosition -= 3;
                        }

                        while (insertPosition > 0) {
                            returnString = StorePanel.insertString(returnString, insertPosition, ",");
                            insertPosition -= 3;
                        }
                        // cc.log("value: "+value+" ret: "+returnString);
                        return returnString;
                    }

                StorePanel.setImageGray = function (image) {
                        image.setBlendFunc(cc.ZERO, cc.ONE_MINUS_SRC_ALPHA); // ciluate black
                    }

                StorePanel.getFocusAction = function () {
                        var scaleUp = cc.ScaleTo.create(0.1, 1.2 * appDelegate.deviceScaleFloat, 1.2 * appDelegate.deviceScaleFloat);
                        var scaleDown = cc.ScaleTo.create(0.1, 1 * appDelegate.deviceScaleFloat, 1 * appDelegate.deviceScaleFloat);
                        var sequence = cc.Sequence.create(scaleUp, scaleDown);
                        var repeat = cc.RepeatForever.create(sequence);

                        return repeat;
                    }

                StorePanel.getTintAction = function () {
                        var tintDark = cc.TintTo.create(0.2, 255, 100, 100);
                        var tintBright = cc.TintTo.create(0.2, 255, 255, 255);
                        var sequence = cc.Sequence.create(tintDark, tintBright);
                        var repeat = cc.RepeatForever.create(sequence);

                        return repeat;
                    }

                //Main
                
                var GameOver = StorePanel.extend({
                        appDelegate: null,

                        init: function () {
                            if (this._super()) {
                                this.initWithSmallWindow();
                                this.appDelegate = AppDelegate.sharedApplication();
                                cc.log("Game Over!");

                                this.laodAll();
                                return true;
                            }
                            return false;
                        },
                        laodAll: function () {
                            var colr = cc.color(106, 138, 162);
                            var layerColor = cc.LayerColor.create(colr, cc.winSize.width, cc.winSize.height);
                            layerColor.setPosition(cc.p(0, 0));
                            this.addChild(layerColor);
                            // layerColor.setOpacity(0.8);

                            var score = localStorage.getItem("currentScore");
                            cc.log("your score: " + score);
                            var bestScore = localStorage.getItem("bestScore");
                            cc.log("best score: " + bestScore);

                            var scoreLabel = StorePanel.createLabel(score, 80 * appDelegate.deviceScaleFloat, true);
                            scoreLabel.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 100 * appDelegate.deviceScaleFloat));
                            scoreLabel.setColor(cc.color(255, 255, 255));
                            // label.setDimensions(cc.size(this.imgBackground.getContentSize().width-50*appDelegate.deviceScaleFloat,200*appDelegate.deviceScaleFloat));
                            this.addChild(scoreLabel, 1);

                            var overLabel = StorePanel.createLabel("Tap and Try", 60 * appDelegate.deviceScaleFloat, false);
                            overLabel.setPosition(cc.p(scoreLabel.getPosition().x, scoreLabel.getPosition().y - 100 * appDelegate.deviceScaleFloat));
                            overLabel.setColor(cc.color(255, 255, 255));
                            // label.setDimensions(cc.size(this.imgBackground.getContentSize().width-50*appDelegate.deviceScaleFloat,200*appDelegate.deviceScaleFloat));
                            this.addChild(overLabel, 1);
                        },
                        onTouchBegan: function (touch, event) {
                            // this.removeFromParentAndCleanup(true);
                            // appDelegate.ghud.loadStorePanel(panel.panelTest);

                            var appLink = "https://play.google.com/store/apps/details?id=com.itiw.dragonjump";
                            // var appLink = "�market://details?id=com.itiw.dragonjump�";
                            cc.sys.openURL("" + appLink);

                            return true;
                        },

                        onTouchMoved: function (touch, event) {

                        },

                        onTouchEnded: function (touch, event) {

                        },
                    });
                    GameOver.create = function () {
                        var ret = new GameOver();

                        if (ret && ret.init()) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }

                var mainPanel = null;

                    var SpriteWithPhysicsBody = cc.Class.extend({
                        appDelegate: null,
                        mass: null,
                        nodeSize: null,
                        phBody: null,
                        shape: null,
                        phNode: null,
                        moment: null,

                        init: function (imgSrc, imgKey, pos, isDynamic, collisionType, name, tag) {
                            //cc.sys.localStorage.clear();
                            this.appDelegate = AppDelegate.sharedApplication();
                            cc.log(name + " created");

                            mainPanel = GamePlay.sharedManager();

                            this.loadSpriteWithPhysicsBody(imgSrc, imgKey, pos, isDynamic, collisionType, name, tag);

                            return true;
                        },
                        loadSpriteWithPhysicsBody: function (imgSrc, imgKey, pos, isDynamic, collisionType, name, tag) {
                            var sprite = StorePanel.createSprite(imgSrc, imgKey);

                            //#2
                            this.nodeSize = sprite.getContentSize();
                            this.phNode = StorePanel.createPhysicsSprite(imgSrc, imgKey);
                            this.phBody = null;
                            var phShape = null;
                            var scaleX = 1;
                            var scaleY = 1;

                            var nodeScale = scaleX;

                            this.nodeSize.width *= scaleX;
                            this.nodeSize.height *= scaleY;

                            //#3
                            this.mass = 1;
                            this.moment = cp.momentForBox(this.mass, this.nodeSize.width, this.nodeSize.height);
                            if (name == "Circle") {
                                this.moment = cp.momentForCircle(this.mass, this.nodeSize.width / 2, this.nodeSize.height / 2, cp.v(0, 0));
                            }
                            // cc.log(name + "--> " + "mass: " + this.mass + ", w: " + this.nodeSize.width + ", h: " + this.nodeSize.height);
                            if (!isDynamic) {
                                this.mass = Infinity;
                                this.moment = Infinity;
                            }
                            this.phBody = new cp.Body(this.mass, this.moment);
                            this.phBody.setPos(cc.p(pos));
                            mainPanel.space.addBody(this.phBody);

                            //#4
                            this.shape = new cp.BoxShape(this.phBody, this.nodeSize.width, this.nodeSize.height);
                            if (name == "Circle") {
                                this.shape = (new cp.CircleShape(this.phBody, this.nodeSize.width / 2, cp.v(0, 0)));
                            }
                            mainPanel.space.addShape(this.shape);
                            // this.shape.setFriction(1);
                            // this.shape.setElasticity(1);
                            this.shape.setCollisionType(collisionType);
                            this.shape.name = name;
                            this.shape.tag = tag;
                            // this.shape.image = sprite;

                            this.phNode.setBody(this.phBody);
                            this.phNode.setScale(nodeScale * appDelegate.deviceScaleFloat);
                            this.phNode.setTag(tag);
                        }

                    });
                    SpriteWithPhysicsBody.create = function (imgSrc, imgKey, pos, isDynamic, collisionType, name, tag) {
                        var ret = new SpriteWithPhysicsBody();

                        if (ret && ret.init(imgSrc, imgKey, pos, isDynamic, collisionType, name, tag)) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }




                

                

                var isTapEnabled = false;
                    var canCountScore = false;
                    var isLevelCompleted = false;
                    var isGameOver = false;
                    var scorePoint = 0;
                    var scoreLimit = 10;
                    var scoreLabel = null;
                    var angle = 0;
                    var targetScore;

                    var panelName;
                    var testList2d;

                    //Sand Balls
                    //golbal variables
                    var size;
                    var shapeArray = [];
                    var sprite_stone;
                    var sprite_stone_physics;
                    var startTouchX;
                    var startTouchY;
                    var endTouchX;
                    var endTouchY;
                    var swipeTolerance = 10;
                    var index_stone;
                    var stone_posX_org;
                    var stone_posY_org;
                    var sprite_target_array = new Array();
                    var sprite_target_physics_array = new Array();
                    var target_killed = 0;
                    var sprite_catapult_rope;
                    var touched = false;
                    var missed = 0;
                    var missed01, missed02, missed03;



                    var GamePlay = StorePanel.extend({
                        layerOnGamePanel: null,
                        isFirstTouch: true,
                        isCompleted: false,
                        nextTask: "nothing",
                        hand: null,
                        noOfCurrentLevel: 0,

                        isCollided: false,

                        space: null,
                        COLLISION_TYPE_BALL: 1,
                        COLLISION_TYPE_BOUNDARY: 2,
                        COLLISION_TYPE_ATTACHED_BONUS: 3,
                        COLLISION_TYPE_FRUIT: 4,

                        init: function () {
                            if (this._super()) {
                                // cc.director.getPhysicsManager().enabled = true;
                                this.initWithSmallWindow();
                                GamePlay.sharedInstance = this;
                                var appDelegate = AppDelegate.sharedApplication();
                                mainPanel = this;

                                size = cc.winSize;

                                cc.log("width " + size.width);
                                cc.log("height " + size.height);
                                //physics
                                this.initPhysics();
                                //   this.initDebugMode();

                                // this.loadLayerOnGamePanel();
                                this.loadTestPanel();
                                this.loadTargets();
                                // this.loadScore();
                                //this.loadNextSequence();
                                this.loadMissedTarget();

                                this.scheduleUpdate();
                                this.space.setDefaultCollisionHandler(this.collisionBegin, null, null, null);
                                return true;
                            }
                            return false;
                        },

                        loadTestPanel: function () {
                            sprite_bg = StorePanel.createSprite(backgroundImgSrc, backgroundImgKey);
                            sprite_bg.setAnchorPoint(cc.p(0.5, 0.5));
                            sprite_bg.setPosition(cc.p(size.width / 2, size.height / 2));

                            if (size.width < 640) {
                                var width_ratio = size.width / sprite_bg.getContentSize().width;
                            }
                            else {
                                var width_ratio = 1; // as i don't want to strech the game background if its in portait mood
                            }
                            if (size.height < 1136) {
                                var height_ratio = size.height / sprite_bg.getContentSize().height;
                            }
                            else {
                                var height_ratio = 1; // as i don't want to strech the game background if its in portait mood
                            }

                            sprite_bg.setScaleX(width_ratio);
                            sprite_bg.setScaleY(height_ratio);
                            this.addChild(sprite_bg);


                            sprite_stone = StorePanel.createSprite(stoneImgSrc, stoneImgKey);
                            sprite_stone.setAnchorPoint(cc.p(0.5, 0.5));
                            stone_posX_org = size.width / 2;
                            stone_posY_org = size.height / 4 - 100 * appDelegate.deviceScaleFloat;
                            sprite_stone.setPosition(cc.p(stone_posX_org, stone_posY_org));
                            sprite_stone.setScale(0.4 * appDelegate.deviceScaleFloat);
                            //  this.addChild(sprite_stone, 1);
                            this.addPhysicsBody(sprite_stone, size.width / 2, size.height / 4 - 100 * appDelegate.deviceScaleFloat, true, stoneImgSrc, stoneImgKey, "circle", 0.5);

                            var sprite_catapult = StorePanel.createSprite(catapultImgSrc, catapultImgKey);
                            sprite_catapult.setAnchorPoint(cc.p(0.5, 0.5));
                            var catapult_posX_org = size.width / 2;
                            var catapult_posY_org = size.height / 4 - 140 * appDelegate.deviceScaleFloat;
                            sprite_catapult.setPosition(cc.p(catapult_posX_org, catapult_posY_org));
                            sprite_catapult.setScale(0.7 * appDelegate.deviceScaleFloat);
                            this.addChild(sprite_catapult, 0);

                            sprite_catapult_rope = StorePanel.createSprite(catapultRopeImgSrc, catapultRopeImgKey);
                            sprite_catapult_rope.setAnchorPoint(cc.p(0.5, 0.5));
                            catapult_posX_org = size.width / 2;
                            catapult_posY_org = size.height / 4 - 140 * appDelegate.deviceScaleFloat;
                            sprite_catapult_rope.setPosition(cc.p(catapult_posX_org, catapult_posY_org));
                            sprite_catapult_rope.setScale(0.7 * appDelegate.deviceScaleFloat);
                            this.addChild(sprite_catapult_rope, 2);


                        },

                        loadMissedTarget: function () {

                            missed01 = StorePanel.createSprite(targetImgSrc, targetImgKey);
                            missed01.setAnchorPoint(cc.p(0.5, 0.5));
                            missed01.setScale(0.20 * appDelegate.deviceScaleFloat);
                            var posMissedX1 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * appDelegate.deviceScaleFloat;
                            var posMissedY1 = size.height - 60 * appDelegate.deviceScaleFloat;
                            missed01.setPosition(cc.p(posMissedX1, posMissedY1));
                            this.addChild(missed01, 2);

                            missed02 = StorePanel.createSprite(targetImgSrc, targetImgKey);
                            missed02.setAnchorPoint(cc.p(0.5, 0.5));
                            missed02.setScale(0.20 * appDelegate.deviceScaleFloat);
                            var posMissedX2 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * appDelegate.deviceScaleFloat;
                            var posMissedY2 = size.height - 120 * appDelegate.deviceScaleFloat;
                            missed02.setPosition(cc.p(posMissedX2, posMissedY2));
                            this.addChild(missed02, 2);

                            missed03 = StorePanel.createSprite(targetImgSrc, targetImgKey);
                            missed03.setAnchorPoint(cc.p(0.5, 0.5));
                            missed03.setScale(0.20 * appDelegate.deviceScaleFloat);
                            var posMissedX3 = (size.width / 2) + (sprite_bg.getContentSize().width / 2) - 80 * appDelegate.deviceScaleFloat;
                            var posMissedY3 = size.height - 180 * appDelegate.deviceScaleFloat;
                            missed03.setPosition(cc.p(posMissedX3, posMissedY3));
                            this.addChild(missed03, 2);

                        },

                        loadTargets: function () {

                            var target_num = 5;
                            var posX, posY;
                            for (var i = 0; i < target_num; i++) {


                                sprite_target_array[i] = StorePanel.createSprite(targetImgSrc, targetImgKey);
                                if (i == 0) {
                                    posX = size.width / 2 - 200 * appDelegate.deviceScaleFloat;
                                    posY = size.height / 2;
                                }
                                else if (i == 1) {
                                    posX = size.width / 2 + 200 * appDelegate.deviceScaleFloat;
                                    posY = size.height / 2;
                                }
                                else if (i == 2) {
                                    posX = size.width / 2 - 200 * appDelegate.deviceScaleFloat;
                                    posY = size.height / 2 + 200 * appDelegate.deviceScaleFloat;
                                }
                                else if (i == 3) {
                                    posX = size.width / 2 + 200 * appDelegate.deviceScaleFloat;
                                    posY = size.height / 2 + 200 * appDelegate.deviceScaleFloat;
                                }
                                else if (i == 4) {
                                    posX = size.width / 2;
                                    posY = size.height / 2 + 300 * appDelegate.deviceScaleFloat;
                                }
                                sprite_target_array[i].setPosition(cc.p(posX, posY));
                                sprite_target_array[i].setScale(0.5 * appDelegate.deviceScaleFloat);
                                this.addPhysicsBodyForTarget(sprite_target_array[i], posX, posY, true, targetImgSrc, targetImgKey, "target", 0.5, i);
                                //  this.addChild(sprite_target_array[i]);



                            }



                        },

                        loadBall: function () {
                            var ball = SpriteWithPhysicsBody.create(ballImgSrc, ballImgKey, cc.p(cc.p(cc.winSize.width / 2, cc.winSize.height / 2)), false, this.COLLISION_TYPE_BALL, "Ball", "ball");
                            this.addChild(ball.phNode);
                        },

                        loadNextSequence: function () {
                            cc.log("nextTask: " + this.nextTask);
                            if (this.nextTask == "nothing") {

                            }
                            else if (this.nextTask == "gameOver") {

                            }
                            else if (this.nextTask == "levelCompleted") {

                            }
                        },

                        loadTutorialHandWithPos: function (_pos) {
                            var addHand = cc.callFunc(function () {
                                this.hand = StorePanel.createSprite(handImgSrc, handImgKey);
                                this.hand.setPosition(_pos);
                                this.addChild(this.hand, 10);
                                this.hand.setScale(1 * appDelegate.deviceScaleFloat);

                                this.moveVertically(this.hand, 1.0, 10);

                            }, this);
                            return addHand;
                        },

                        moveVertically: function (item, movingTime, moveAmount) {
                            var moveUp = cc.MoveTo.create(movingTime, cc.p(item.x, item.y + moveAmount * appDelegate.deviceScaleFloat));
                            var moveDown = cc.MoveTo.create(movingTime, cc.p(item.x, item.y - moveAmount * appDelegate.deviceScaleFloat));
                            item.runAction(cc.RepeatForever.create(cc.Sequence.create(moveUp, moveDown)));
                        },
                        makeActive: function (dt) {
                            canCountScore = true;
                        },

                        initPhysics: function () {
                            this.space = new cp.Space();
                            this.space.gravity = cp.v(0.0, 0.0);
                        },

                        initDebugMode: function () {
                            var debugDraw = cc.PhysicsDebugNode.create(this.space);
                            debugDraw.setVisible(true);
                            this.addChild(debugDraw, 10);
                        },

                        collisionBegin: function (arbiter, space) {
                            if ((arbiter.a.name == "circle" && arbiter.b.name == "target") || (arbiter.b.name == "target" && arbiter.a.name == "circle")) {
                                cc.log("collided");
                                target_killed++;
                                arbiter.a.body.vx = 0;
                                arbiter.a.body.vy = 0;

                                var arrayShapes = arbiter.getShapes();
                                var bodyAsteroid = arrayShapes[1].body;

                                //removing physicSprite
                                var target_no = arrayShapes[1].tag;
                                mainPanel.removeChild(sprite_target_array[target_no]);
                                //removing body and shape                   
                                space.addPostStepCallback(function () {
                                    space.removeBody(bodyAsteroid);
                                    space.removeShape(arrayShapes[1]);
                                });

                                //setting the position of the stone to original
                                sprite_stone_physics.setPosition(cp.v(stone_posX_org, stone_posY_org));

                            }

                        },

                        addPhysicsBody: function (bodySprite, posX, posY, isDynamic, spriteImageSrc, spriteImageKey, type, scaleFactor, obs_num) {
                            sprite_stone_physics = StorePanel.createPhysicsSprite(spriteImageSrc, spriteImageKey);
                            sprite_stone_physics.setAnchorPoint(cc.p(0.5, 0.5));
                            sprite_stone_physics.setScale(scaleFactor * appDelegate.deviceScaleFloat);
                            this.addChild(sprite_stone_physics, 1);


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
                            //   shape.setCollisionType(0);
                            shape.name = type;
                            //Putting image of the sprite in the shape
                            shape.image = bodySprite;
                            this.space.addShape(shape);
                            shapeArray.push(shape);

                            sprite_stone_physics.setBody(body);


                        },

                        addPhysicsBodyForTarget: function (bodySprite, posX, posY, isDynamic, spriteImageSrc, spriteImageKey, type, scaleFactor, obs_num) {
                            sprite_target_array[obs_num] = StorePanel.createPhysicsSprite(spriteImageSrc, spriteImageKey);
                            sprite_target_array[obs_num].setAnchorPoint(cc.p(0.5, 0.5));
                            sprite_target_array[obs_num].setScale(scaleFactor * appDelegate.deviceScaleFloat);
                            this.addChild(sprite_target_array[obs_num], 1);


                            var width = bodySprite.getContentSize().width * bodySprite.getScaleX();
                            var height = bodySprite.getContentSize().height * bodySprite.getScaleY();

                            if (isDynamic) {
                                //  var body = new cp.Body(1,cp.momentForBox(1,width,height));
                                //  if(type=="circle"){
                                var body = new cp.Body(1, cp.momentForCircle(1, 0, width * 0.5, cc.p(0, 0)));
                                //   }
                            }
                            else {
                                var body = new cp.Body(Infinity, Infinity);
                            }
                            body.setPos(cp.v(posX, posY));
                            if (isDynamic) {
                                this.space.addBody(body);
                            }

                            //adding shape
                            //  var shape = new cp.BoxShape(body, width, height);
                            //  if(type=="circle"){
                            var shape = new cp.CircleShape(body, width * 0.5, cc.p(0, 0));
                            //  }


                            shape.setFriction(1);
                            shape.setElasticity(0.5);
                            //   shape.setCollisionType(0);
                            shape.name = type;
                            //Putting image of the sprite in the shape
                            shape.image = bodySprite;

                            shape.tag = obs_num;
                            this.space.addShape(shape);
                            shapeArray.push(shape);

                            sprite_target_array[obs_num].setBody(body);

                            var sprite_action_jump = cc.JumpTo.create(2, cc.p(sprite_target_array[obs_num].getPositionX(), sprite_target_array[obs_num].getPositionY()), 5, 3);
                            // sprite_target_array[obs_num].runAction(sprite_action_jump);

                            var repeat_action = cc.RepeatForever.create(sprite_action_jump);
                            sprite_target_array[obs_num].runAction(repeat_action);





                        },

                        update: function (dt) {
                            this.space.step(dt);

                            //We loop through our custom variable, shapeArray, and update each shape image according to its body position and rotation
                            for (var i = shapeArray.length - 1; i >= 0; i--) {
                                shapeArray[i].image.x = shapeArray[i].body.p.x
                                shapeArray[i].image.y = shapeArray[i].body.p.y
                                var angle = Math.atan2(-shapeArray[i].body.rot.y, shapeArray[i].body.rot.x);
                                shapeArray[i].image.rotation = angle * 57.2957795;
                            }


                            //Set the stone in orginal position after movement
                            var bgStartPos = size.width / 2 - sprite_bg.getContentSize().width / 2 * sprite_bg.getScaleX();
                            var bgEndPos = size.width / 2 + sprite_bg.getContentSize().width / 2 * sprite_bg.getScaleX();

                            if (sprite_stone_physics.getPositionX() < bgStartPos || sprite_stone_physics.getPositionX() > bgEndPos || sprite_stone_physics.getPositionY() > size.height) {

                                this.scheduleOnce(this.setInOrgPos, 0.75);
                            }

                            //finding if all targets are killed
                            if (target_killed == 5) {
                                cc.log("Game end");
                                this.scheduleOnce(this.removingAll("You Won"), 2);
                            }


                            //updating the missed image after each shot is missed and ending game after all missed
                            if (missed == 3) {
                                mainPanel.removeChild(missed01);
                                this.scheduleOnce(this.removingAll("You Lost"), 2);
                            }

                            if (missed == 1) {
                                mainPanel.removeChild(missed03);
                            }

                            if (missed == 2) {
                                mainPanel.removeChild(missed02);
                            }

                        },

                        setInOrgPos: function () {

                            sprite_stone_physics.setPosition(cp.v(stone_posX_org, stone_posY_org));
                            sprite_stone_physics.body.vx = 0;
                            sprite_stone_physics.body.vy = 0;
                            missed++;
                            cc.log("missed " + missed);

                        },

                        removingAll: function (text) {

                            this.unscheduleUpdate();
                            this.removeAllChildren(true);
                            this.showEndGame(text);

                        },

                        showEndGame: function (text) {

                            var label = StorePanel.createLabel(text, 80 * appDelegate.deviceScaleFloat);
                            label.setPosition(cc.p(size.width / 2, size.height / 2));
                            label.setColor(cc.color(255, 0, 0));
                            this.addChild(label, 4);

                        },

                        loadLayerOnGamePanel: function () {
                            var colr = cc.color(0, 0, 0);
                            this.layerOnGamePanel = cc.LayerColor.create(colr, cc.winSize.width, cc.winSize.height);
                            this.layerOnGamePanel.setPosition(cc.p(0, 0));
                            this.addChild(this.layerOnGamePanel);
                            this.layerOnGamePanel.setOpacity(1 * 255);
                        },

                        loadSpriteWithPos: function (itemName, itemKey, _pos) {
                            var sprite = StorePanel.createSprite(itemName, itemName);
                            sprite.setPosition(_pos);
                            this.addChild(sprite);
                            sprite.setScale(appDelegate.deviceScaleFloat);
                            return sprite;
                        },

                        loadBg: function (bgSrc, bgKey) {
                            this.bg = StorePanel.createSprite(bgSrc, bgKey);
                            this.bg.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);
                            this.addChild(this.bg);
                            this.bg.setScale(appDelegate.deviceScaleFloat);
                        },

                        loadScore: function () {
                            scoreLabel = StorePanel.createLabel("" + scorePoint.toString(), 60 * appDelegate.deviceScaleFloat);
                            scoreLabel.setPosition(cc.p(cc.winSize.width / 2, cc.winSize.height / 2 + 450 * appDelegate.deviceScaleFloat));

                            this.addChild(scoreLabel, 10);
                        },

                        randomNum: function (min, max) {
                            return Math.floor(Math.random() * (max - min)) + min;
                        },

                        loadItems: function () {

                        },
                        drawShape: function () {

                        },
                        updateScore: function (isBonus) {

                        },
                        jumpBall: function () {

                        },
                        gameCompleted: function () {

                        },
                        scoreUpdate: function (dt) {

                        },
                        onTouchBegan: function (touch, event) {


                            for (var i = shapeArray.length - 1; i >= 0; i--) {
                                if (shapeArray[i].pointQuery(cp.v(touch.getLocation().x, touch.getLocation().y)) != undefined) {
                                    if (shapeArray[i].name == "circle") {
                                        index_stone = i;
                                        startTouchX = shapeArray[i].body.p.x;
                                        startTouchY = shapeArray[i].body.p.y;
                                        //  sprite_stone_physics.body.applyImpulse(cp.v(100,500), cp.v(10,0));
                                        //  cc.log("startTouch "+ shapeArray[i].body.p.x +"  "+ shapeArray[i].body.p.y);
                                        cc.log("startTouch X--" + startTouchX);
                                        cc.log("startTouch Y-- " + startTouchY);
                                        touched = true;

                                    }
                                }
                            }

                            //  sprite_stone_physics.angularVelocity = 3000;
                            //   sprite_stone_physics.body.applyImpulse(cp.v(100,500), cp.v(10,0));
                            return true;
                        },

                        onTouchMoved: function (touch, event) {
                            for(var i=shapeArray.length-1;i>=0;i--){
                                if(shapeArray[i].pointQuery(cp.v(touch.getLocation().x,touch.getLocation().y))!=undefined){
                                if(shapeArray[i].name=="circle"){
                                    //move the shape
                                    var stone_width = sprite_stone_physics.getContentSize().width * sprite_stone_physics.getScale();
                                    if(touch.getLocation().x> stone_width/2 && touch.getLocation().x < size.width - stone_width/2){
                                        shapeArray[i].body.p.x = touch.getLocation().x;
                                    }
                                    if(touch.getLocation().y> (sprite_stone_physics.getContentSize().height * sprite_stone_physics.getScale())/2 && touch.getLocation().y < shapeArray[i].body.p.y){
                                         shapeArray[i].body.p.y = touch.getLocation().y;
                                     
                                    }
    
                                    //srew the rope
                                //    var nodeAction = new cc.SkewBy( 0, 2, 0 );
                                //    sprite_catapult_rope.runAction( nodeAction );
                                    
                                   
                            
    
                                }
                                }
                            }

                        },

                        onTouchEnded: function (touch, event) {

                            cc.log("In touch end");

                            //   for(var i=shapeArray.length-1;i>=0;i--){
                        //    if(shapeArray[i].pointQuery(cp.v(touch.getLocation().x,touch.getLocation().y))!=undefined){
                        //    if(shapeArray[i].name=="circle"){
                             //   endTouchX = shapeArray[index_stone].body.p.x;
                             //   endTouchY = shapeArray[index_stone].body.p.y;
                             if(touched==true){
                                endTouchX = touch.getLocation().x;
                                endTouchY = touch.getLocation().y;

                                //  sprite_stone_physics.body.applyImpulse(cp.v(100,500), cp.v(10,0));
                                cc.log("endTouchX--"+ endTouchX);
                                cc.log("endTouchY--"+ endTouchY);

                                var distanceX = startTouchX - endTouchX;
                                var distanceY = startTouchY - endTouchY;


                                cc.log("distanceX  "+ distanceX);
                                cc.log("distanceY  "+ distanceY);

                                if(distanceY>=20){
                                    sprite_stone_physics.body.applyImpulse(cp.v(distanceX * 9,distanceY * 9), cp.v(0,0));
                                }
                                else{
                                   shapeArray[index_stone].body.p.x = stone_posX_org;                             
                                   shapeArray[index_stone].body.p.y = stone_posY_org;
                                }
                                
                                touched = false;

                                }

                                sprite_stone_physics.setPosition(cp.v(stone_posX_org,stone_posY_org));
                                
                              

                        //    }
                        //    }
                     //   }
                        

                     //   this.swipeDirection();

                        },

                        swipeDirection: function () {
                            var distX = startTouch.x - endTouch.x;
                            var distY = startTouch.y - endTouch.y;
                            if (Math.abs(distX) + Math.abs(distY) > swipeTolerance) {
                                if (Math.abs(distX) > Math.abs(distY)) {
                                    if (distX > 0) {

                                        cc.log("swiped left");


                                        //move(-1,0);
                                    }
                                    else {

                                        cc.log("swiped right");

                                        //move(1,0);
                                    }
                                }
                                else {
                                    if (distY > 0) {

                                        //move(0,1);
                                    }
                                    else {

                                        //move(0,-1);
                                    }
                                }
                            }
                        },
                    });













                    GamePlay.sharedInstance = null;
                    GamePlay.sharedManager = function () {
                        return GamePlay.sharedInstance;
                    }

                GamePlay.create = function () {
                        var ret = new GamePlay();

                        if (ret && ret.init()) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }
                var GameHud = cc.Layer.extend({

                        init: function () {
                            if (this._super()) {
                                //this.runAction(cc.Sequence.create(cc.delayTime(0.1),cc.CallFunc.create(this.callAfterLoad, this)));
                                this.callAfterLoad();
                                return true;
                            }
                            return false;
                        },

                        callAfterLoad: function () {
                            // cc.log("callAfterLoad 1");


                        },

                        loadStorePanel: function (panelId) {
                            switch (panelId) {
                                case panel.panelGame:
                                    {
                                        var gamePlay = GamePlay.create();
                                        this.addChild(gamePlay, 1);
                                    }
                                    break;
                                case panel.panelTest:
                                    {
                                        var gameTest = GameTest.create();
                                        this.addChild(gameTest, 1);
                                    }
                                    break;
                            }
                        }

                    });
                    GameHud.create = function () {
                        var ret = new GameHud();

                        if (ret && ret.init()) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }
                var GameNode = cc.Layer.extend({
                        init: function () {
                            if (this._super()) {
                                var appDelegate = AppDelegate.sharedApplication();
                                appDelegate.ghud.loadStorePanel(panel.panelGame);
                                //var resources=Resources.sharedManager();

                                return true;
                            }
                            return false;
                        },

                        runTimeLoadCompleted: function (tag) {
                            if (tag == "egg") {

                            }
                        }

                    });




                    GameNode.create = function () {
                        var ret = new GameNode();
                        if (ret && ret.init()) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }

                var GameNodeScene = cc.Scene.extend({
                        onEnter: function () {
                            this._super();
                            var appDelegate = AppDelegate.sharedApplication();

                            var gameHud = GameHud.create();
                            this.addChild(gameHud, 1);
                            appDelegate.ghud = gameHud;

                            var gameNode = GameNode.create();
                            this.addChild(gameNode);
                            appDelegate.gnode = gameNode;
                            // cc.director.getPhysicsManager().enabled = true;                
                        },

                        loadBackground: function () {
                            var sprite = StorePanel.createSprite(bgImgSrc, bgImgKey);
                            sprite.setPosition(cc.size.width / 2, cc.size.height / 2);
                            this.addChild(sprite, 0);
                        },
                    });

                    var AppDelegate = cc.Layer.extend({
                        deviceScaleFloat: 1,

                        gnode: null,
                        ghud: null,
                        selectedObjectId: [],

                        autoBattleType: 0,
                        isOtherVillage: false,
                        otherVillageData: null,
                        friendsVillageLBScores: [],

                        myVillageData: null,

                        isTouchSwallowed: false,

                        isCalledFbMethod: false,

                        init: function () {
                            if (this._super()) {
                                //cc.sys.localStorage.clear();
                                this.deviceScaleFloat = 1;

                                var rectSize = cc.view.getFrameSize();

                                //for potarit    
                                if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
                                    if (rectSize.height == 2436 && rectSize.width == 1125) this.deviceScaleFloat = 1.65;
                                    else if (rectSize.height == 2208 && rectSize.width == 1242) this.deviceScaleFloat = 1.92;
                                    else if (rectSize.height == 1334 && rectSize.width == 750) this.deviceScaleFloat = 1.17;
                                    else if (rectSize.height == 2048 && rectSize.width == 1536) this.deviceScaleFloat = 1.9;
                                    else if (rectSize.height == 1024 && rectSize.width == 768) this.deviceScaleFloat = 0.95;
                                }
                                else {
                                    if (rectSize.height == 2436 && rectSize.width == 1125) this.deviceScaleFloat = 1.65;
                                    else if (rectSize.height == 2208 && rectSize.width == 1242) this.deviceScaleFloat = 1.92;
                                    else if (rectSize.height == 1334 && rectSize.width == 750) this.deviceScaleFloat = 1.17;
                                    else if (rectSize.height == 2048 && rectSize.width == 1536) this.deviceScaleFloat = 1.9;
                                    else if (rectSize.height == 1024 && rectSize.width == 768) this.deviceScaleFloat = 0.95;

                                    else if (rectSize.height >= 2048 && rectSize.width >= 640 * 2.0) this.deviceScaleFloat = 2.0;
                                    else if (rectSize.height >= 1792 && rectSize.width >= 640 * 1.75) this.deviceScaleFloat = 1.75;
                                    else if (rectSize.height >= 1536 && rectSize.width >= 640 * 1.5) this.deviceScaleFloat = 1.5;
                                    else if (rectSize.height >= 1280 && rectSize.width >= 640 * 1.25) this.deviceScaleFloat = 1.25;
                                    else if (rectSize.height >= 1152 && rectSize.width >= 640 * 1.125) this.deviceScaleFloat = 1.125;
                                    else if (rectSize.height >= 960 && rectSize.width >= 640 * 1.0) this.deviceScaleFloat = 1.0;
                                    else if (rectSize.height >= 840 && rectSize.width >= 640 * 0.875) this.deviceScaleFloat = 0.875;
                                    else if (rectSize.height >= 720 && rectSize.width >= 640 * 0.75) this.deviceScaleFloat = 0.75;
                                    else if (rectSize.height >= 480 && rectSize.width >= 640 * 0.5) this.deviceScaleFloat = 0.5;
                                    else deviceScaleFloat = 0.4;
                                }

                                // cc.log("rectSize.height / rectSize.width " + rectSize.height + " " + rectSize.width);

                                // cc.log("this.deviceScaleFloat " + this.deviceScaleFloat);

                                this.runAction(cc.Sequence.create(cc.CallFunc.create(this.cache64Images, this), cc.delayTime(0.1), cc.CallFunc.create(this.callAfterLoad, this)));

                                return true;
                            }
                            return false;
                        },

                        cache64Images: function () {
                            StorePanel.cacheBase64Image(backgroundImgSrc, backgroundImgKey);
                            StorePanel.cacheBase64Image(targetImgSrc, targetImgKey);
                            StorePanel.cacheBase64Image(stoneImgSrc, stoneImgKey);
                            StorePanel.cacheBase64Image(catapultImgSrc, catapultImgKey);
                            StorePanel.cacheBase64Image(catapultRopeImgSrc, catapultRopeImgKey);




                            // var preloader = new Audio();
                            // preloader.src = "data:audio/mp3;base64," + ballOnTileSoundSrc;
                        },

                        callAfterLoad: function () {
                            this.isTouchSwallowed = false;
                            this.isOtherVillage = false;

                            // this.myVillageData=VillageData.create(true,null);
                            // cc.log("my scene added");
                            cc.director.runScene(new GameNodeScene());

                            /*if(!cc.sys.isNative && !isLocalhost)
                            {
                                FBInstantManager.getFriendsVillageLBScores("All Players Scores");
                            }
                            this.pausOn();*/
                        },

                        willDataUpdate: function () {
                            if (this.isOtherVillage == true)
                                return false;
                            return true;
                        }

                    });

                    AppDelegate.sharedInstance = null;

                    AppDelegate.sharedApplication = function () {
                        if (AppDelegate.sharedInstance == null) {
                            AppDelegate.sharedInstance = AppDelegate.create();
                        }
                        return AppDelegate.sharedInstance;
                    }

                AppDelegate.isTileMapExpand = 0;

                    AppDelegate.create = function () {
                        var ret = new AppDelegate();

                        if (ret && ret.init()) {
                            return ret;
                        } else {
                            delete ret;
                            ret = null;
                            return null;
                        }
                    }

                var AppDelegateScene = cc.Scene.extend({
                        onEnter: function () {
                            this._super();

                            var appDelegate = AppDelegate.sharedApplication();
                            this.addChild(appDelegate, 1);
                        }
                    });
                    //-----

                    cc._loaderImage = targetImgSrc;
                    cc.LoaderScene.preload([], function () {
                        cc.director.runScene(new AppDelegateScene());
                    }, this);
                };
                cc.game.run("gameCanvas");
            };
    </script>
</body >
</html >