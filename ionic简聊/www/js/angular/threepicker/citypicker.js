﻿ 
"use strict";
angular.module('citypicker', ['ionic', 'ionic-citydata'])
.directive('cityPicker', ['$ionicPopup', '$timeout','CityPickerService','$ionicScrollDelegate','$ionicModal', function ($ionicPopup, $timeout,CityPickerService, $ionicScrollDelegate,$ionicModal) {
  return {
    restrict: 'AE',
    template: '<span class="item-note">{{citydata}}</span><button  class="button ion ion-edit button-clear button-positive"></button>',
    scope: {
        citydata: '@',
        backdrop: '@',
        backdropClickToClose: '@',
        datatype:'@',
        buttonClicked: '&'
    },
    link: function (scope, element, attrs) {
        var vm=scope.vm={},citypickerModel=null,datainit;
        //根据城市数据来 设置Handle。
        vm.provinceHandle="provinceHandle"+attrs.handle;
        vm.cityHandle = "cityHandle" + attrs.handle;
        vm.countryHandle = "countryHandle" + attrs.handle;
        vm.placeholder=attrs.placeholder || "请选择城市";
        vm.okText = attrs.okText || "确定";
        vm.cancelText = attrs.cancelText || "取消";
        vm.cssClass=attrs.cssClass;
        vm.barCssClass = attrs.barCssClass || "bar-positive";
        vm.backdrop=scope.$eval(scope.backdrop) || false;
        vm.backdropClickToClose=scope.$eval(scope.backdropClickToClose) || false;
        if (scope.datatype == "city") {
            vm.cityData = CityPickerService.cityList;
        }
        else if (scope.datatype == "date") {
            vm.cityData = CityPickerService.dateList;
        }
        vm.tag=attrs.tag || "-";
        vm.returnOk = function () {
            
            citypickerModel && citypickerModel.hide();
            scope.$parent.info.threedata = scope.citydata = datainit;
            scope.buttonClicked && scope.buttonClicked();
        }
        vm.returnCancel = function () {
            citypickerModel && citypickerModel.hide();
        }
        vm.clickToClose = function () {
          vm.backdropClickToClose && citypickerModel && citypickerModel.hide();
        }
        vm.getData=function(name){
          $timeout.cancel(vm.scrolling);//取消之前的scrollTo.让位置一次性过渡到最新
          $timeout.cancel(vm.dataing);//取消之前的数据绑定.让数据一次性过渡到最新
          switch(name)
          {
            case 'province':
              if (!vm.cityData) return false;
              var province=true,length=vm.cityData.length,Handle=vm.provinceHandle,HandleChild=vm.cityHandle;
            break;
            case 'city':
              if (!vm.province.sub) return false;
              var city=true,length=vm.province.sub.length,Handle=vm.cityHandle,HandleChild=vm.countryHandle;
            break;
            case 'country':
              if (!vm.city.sub) return false;
              var country=true,Handle=vm.countryHandle,length=vm.city.sub.length;
            break;
          }
          var top= $ionicScrollDelegate.$getByHandle(Handle).getScrollPosition().top;//当前滚动位置
          var index = Math.round(top / 36);
          if (index < 0 ) index =0;//iOS bouncing超出头
          if (index >length-1 ) index =length-1;//iOS bouncing超出尾
          if (top===index*36 ) {
            vm.dataing=$timeout(function () {
                province && (vm.province=vm.cityData[index],vm.city=vm.province.sub[0],vm.country={},(vm.city && vm.city.sub && (vm.country=vm.city.sub[0])));//处理省市乡联动数据
                city &&  (vm.city=vm.province.sub[index],vm.country={},(vm.city && vm.city.sub && (vm.country=vm.city.sub[0])));//处理市乡联动数据
                country &&  (vm.country=vm.city.sub[index]);//处理乡数据
                HandleChild && $ionicScrollDelegate.$getByHandle(HandleChild).scrollTop();//初始化子scroll top位
                //数据同步
                (vm.city.sub && vm.city.sub.length > 0) ? (datainit = vm.province.name + vm.tag + vm.city.name + vm.tag + vm.country.name) : (datainit = vm.province.name + vm.tag + vm.city.name)
            },150)
          }else{
            vm.scrolling=$timeout(function () {
             $ionicScrollDelegate.$getByHandle(Handle).scrollTo(0,index*36,true);
            },80)
          }

        }

        element.on("click", function () {
            
            //零时处理 点击过之后直接显示不再创建
            if (!attrs.checked) {
              citypickerModel && citypickerModel.remove();
            }else{
              citypickerModel && citypickerModel.show();  
              return
            }
            attrs.checked=true;
            $ionicModal.fromTemplateUrl('js/angular/threepicker/citypickermodal.html', {
                scope: scope,
                animation: 'slide-in-up',
                backdropClickToClose: vm.backdropClickToClose
            }).then(function (modal) {
                citypickerModel = modal;
                //初始化 先获取数据后展示
                $timeout(function () {
                    vm.getData('province');
                    citypickerModel.show();
                }, 100)
            });
        })
        //销毁模型
        scope.$on('$destroy', function() {
          citypickerModel && citypickerModel.remove();
        });
    }
  }
}]);