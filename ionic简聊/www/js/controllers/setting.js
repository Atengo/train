'use strict';

angular.module('flbottle.controllers')
    //设置控制器》App控制器
    .controller('SettingCtrl', function($scope,$cordovaToast, $cordovaFile, config, $ionicPopup, $cordovaFileTransfer, $cordovaCamera, $ionicActionSheet, $ionicLoading, $state, $ionicModal, Setting, Storage) {
        var token = Storage.get("token");
        var infodef;
        var api = config.ENV.domain;
        $scope.avatar = Storage.get('clientAvatar');
        console.log($scope.avatar)
        $scope.onupload = false; // 上传控制参数

        function getSetting(cb) {
            $ionicLoading.show({
                content: '获取中...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            Setting.getsetting(token).$promise.then(function(res) {
                if (res.bool) {
                    res.time=moment(res.time).format('YYYY-MM-DD')
                    $scope.info = infodef = JSON.stringify(res); //转换成字符串，防止引用
                    $scope.info = JSON.parse($scope.info);
                    infodef = JSON.parse(infodef); //创建默认设置值对象
                    delete $scope.info.avatar; //头像信息独立上传保存，不进行检测
                    delete infodef.avatar;
                    console.log(isObjectValueEqual(infodef, $scope.info))
                    $scope.set.issetting = $scope.info.setting;
                    $ionicLoading.hide();
                    if (typeof(cb) == 'function') {
                        cb();
                    }
                } else {
                    $ionicLoading.hide();
                    $scope.manage.showTip(res.mes,"short","bottom");
                }
            }, function(res) {
                $ionicLoading.hide();
                $scope.manage.showTip("获取设置失败！","short","bottom");
            })
        }
        getSetting();
        // 设置头像
        // "添加附件"Event  
        $scope.addAttachment = function() {
            $ionicActionSheet.show({
                buttons: [{
                    text: '相机'
                }, {
                    text: '图库'
                }],
                cancelText: '关闭',
                cancel: function() {
                    return true;
                },
                buttonClicked: function(index) {
                    switch (index) {
                        case 0:
                            appendByCamera();
                            break;
                        case 1:
                            pickImage();
                            break;
                        default:
                            break;
                    }
                    return true;
                }
            });
        }
        var pickImage = function() {
            var options = {
                //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
                quality: 100, //相片质量0-100
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY, //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
                allowEdit: true, //在选择之前允许修改截图
                targetWidth: 180, //照片宽度
                targetHeight: 180, //照片高度
            };
            $cordovaCamera.getPicture(options).then(function(imageData) {
                if (imageData) {
                    $scope.avatar = imageData;
                    $scope.upload(imageData)
                }
            }, function(err) {
                $scope.manage.showTip("操作失败！","short","bottom");
            });
        }
        var appendByCamera = function() {
            var options = {
                //这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
                quality: 100, //相片质量0-100
                destinationType: Camera.DestinationType.FILE_URI, //返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
                sourceType: Camera.PictureSourceType.CAMERA, //从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
                allowEdit: true, //在选择之前允许修改截图
                encodingType: Camera.EncodingType.JPEG, //保存的图片格式： JPEG = 0, PNG = 1
                targetWidth: 180, //照片宽度
                targetHeight: 180, //照片高度
                mediaType: 0, //可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
                cameraDirection: 1, //枪后摄像头类型：Back= 0,Front-facing = 1
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: true //保存进手机相册
            };
            $cordovaCamera.getPicture(options).then(function(imageData) {
                if (imageData) {
                    $scope.avatar = imageData;
                    $scope.upload(imageData)
                }
            }, function(err) {
                $scope.manage.showTip("操作失败！","short","bottom");
            });
        }

        // 上传头像
        $scope.upload = function(imgurl) {
            $scope.onupload = true;
            var options = {
                params: {
                    token: token
                }
            };
            $cordovaFileTransfer.upload(api + '/setting/uploadheadimage', imgurl, options)
                .then(function(result) {
                    var res = JSON.parse(result.response)
                    Storage.set('clientAvatar', res.url);
                    $scope.account.avatar = res.url;
                    $scope.onupload = false;
                }, function(err) {
                    $scope.uploadProgress = "上传失败"
                }, function(progress) {
                    $scope.uploadProgress = ((progress.loaded / progress.total) * 100).toString().substr(0, 4) + "%";
                });
        }
        $scope.sex = { //性别选择控制列表
            sexchooselist: [{
                value: "男"
            }, {
                value: "女"
            }]
        }
        $scope.choosesex = function() {
            $scope.myPopup = $ionicPopup.show({
                title: '话题性别',
                template: '<div class="list popupradio"><ion-radio ng-repeat="item in sex.sexchooselist" name="sex" ng-model="info.sex"  ng-value="item.value" ng-click="checksetting();myPopup.close();">{{ item.value }}</ion-radio></div>',
                scope: $scope
            });
        }
        $scope.settingrefresh = function() { //下拉刷新设置
                getSetting(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                });
            }
            //检查两个对象的每个值是否相同
        function isObjectValueEqual(a, b) {
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);
            if (aProps.length != bProps.length) {
                return false;
            }

            for (var i = 0; i < aProps.length; i++) {
                var propName = aProps[i];
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
            return true;
        }
        $scope.checksetting = function() { //检查设置是否改变
            if (isObjectValueEqual(infodef, $scope.info)) {
                $scope.set.issetting = false;
            } else {
                $scope.set.issetting = true;
            }

        }
        $scope.editlivecity = function() { //获取修改居住城市
            $scope.info.livecity = $scope.info.threedata;
            $scope.checksetting();
        }
        $scope.editbirthcity = function() { //获取修改出生城市
            $scope.info.birthcity = $scope.info.threedata;
            $scope.checksetting();
        }
        $scope.editbirthday = function() { //获取修改生日      
                $scope.info.birthday = $scope.info.threedata;
                $scope.checksetting();
            }
            //修改基本信息
        $ionicModal.fromTemplateUrl('templates/setbase_modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.setbase_modal = modal;
        });
        $scope.editbaseinfo = function() {
                console.log($scope.info.threedata)
            }
            //修改邮箱密码
        $ionicModal.fromTemplateUrl('templates/safeset_modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.safeset_modal = modal;
        });
        //重置基本信息设置
        $scope.resetbaseinfo = function() {
                $scope.info.name = infodef.name;
                $scope.info.sex = infodef.sex;
                $scope.info.sign = infodef.sign;
                $scope.checksetting();
                $scope.setbase_modal.hide()
            }
            //保存设置
        $scope.set.savesetting = function() {
            $ionicLoading.show({
                content: '保存中...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            Setting.savesetting(token, $scope.info).$promise.then(function(res) {
                console.log(res)
                if (res.bool) {
                    $scope.manage.showTip("保存成功！","short","bottom");
                    if ($scope.info.name != '未设置' && $scope.info.name != '' && $scope.info.sex != '未设置' && $scope.info.birthday != '未设置' && $scope.info.birthcity != '未设置' && $scope.info.livecity != '未设置') {
                        Storage.set('setready', 1);
                        $scope.set.vibrate = $scope.info.shock;
                        $scope.set.voile = $scope.info.voile;
                        Storage.set("setting", {
                            voile: $scope.info.voile,
                            shock: $scope.info.shock
                        });

                    } else {
                        Storage.set('setready', 0);
                    }
                    getSetting(function() {
                        $ionicLoading.hide();
                    });
                } else {
                    $ionicLoading.hide();
                    $scope.manage.showTip(res.mes,"short","bottom");
                }
            }, function(res) {
                $ionicLoading.hide();
                $scope.manage.showTip("操作失败！","short","bottom");
            });
        }
    })