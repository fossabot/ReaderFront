(function() {
  'use strict';

  angular
    .module('app.reader')
    .controller('ReaderController', ReaderController);

  ReaderController.$inject = ['$scope','$q','logger', 'Api', '$stateParams', 'hotkeys', '$location', '$anchorScroll'];
  /* @ngInject */
  function ReaderController($scope, $q, logger, Api, $stateParams, hotkeys, $location, $anchorScroll) {
    var vm = this;
    vm.comic = [];
    vm.comics = [];
    vm.chapter = [];
    vm.chapters = [];
    vm.chaptersOneshots = [];
    vm.pages = [];
    vm.pagesList = [];
    vm.pageSelected = 1;
    vm.params = $stateParams;
    vm.chapterSelected = vm.params.chapter;
    vm.lastPage = 0;
    vm.getComic = getComic;
    vm.getComics = getComics;
    vm.changePageSelected = changePageSelected;
    vm.changePageClick = changePageClick;
    vm.setDisqusConfig = setDisqusConfig;

    loadReader();

    function loadReader() {
      var promises = [getComic(), getComics()];
      return $q.all(promises).then(function() {
        logger.info('Use W-A-S-D or the arrow keys to navigate');
      });
    }

    function setDisqusConfig() {
      $scope.disqusConfig = {
        disqus_shortname: 'ravens-scans-english',
        disqus_identifier: 'RS_' + vm.params.id + '_' + vm.params.chapter,
        disqus_url: window.location.href,
        disqus_title: vm.comic.name + ' chapter ' + vm.chapter.chapter + ' - ' + $scope.siteName,
        disqus_disable_mobile: 'false'
      };
    }

    function getComic() {
      var query = {};
      if (typeof(vm.params.chapter) !== 'undefined' && vm.params.chapter.indexOf('.') !== -1) {
        query = { stub: vm.params.id, chapter: vm.params.chapter.split('.')[0], subchapter: vm.params.chapter.split('.')[1] };
      } else {
        query = { stub: vm.params.id, chapter: vm.params.chapter };
      }
      return Api.getComic(query)
        .then(function (data) {
          vm.comic = data.comic;
          angular.forEach(data.chapters, function (value, key) {
            if (vm.params.chapter.indexOf('.') !== -1) {
              if (value.chapter.chapter === vm.params.chapter.split('.')[0] && value.chapter.subchapter === vm.params.chapter.split('.')[1]) {
                vm.chapter = value.chapter;
              }
            } else {
              if (value.chapter.chapter === vm.chapterSelected && value.chapter.subchapter === '0') {
                vm.chapter = value.chapter;
              }
            }
            if (vm.comic.name === 'Oneshots') {
              vm.chaptersOneshots.push(value.chapter.name);
            }
            if (value.chapter.subchapter !== null && value.chapter.subchapter !== '0') {
              vm.chapters.push(value.chapter.chapter + '.' + value.chapter.subchapter);
            } else {
              vm.chapters.push(value.chapter.chapter);
            }
          });
          vm.pages = vm.chapter.pages;
          angular.forEach(vm.pages, function (value, key) {
            vm.pagesList.push(key + 1);
          });
          vm.lastPage = vm.pages.length;
          setDisqusConfig();
          return vm.comic;
        });
    }

    function getComics() {
      return Api.comicsList()
       .then(function(data) {
         vm.comics = data[0].comics;
         return vm.comics;
       });
    }

    function changePageSelected(page) {
      if (page === null || vm.pageSelected === vm.lastPage) {
        vm.pageSelected = 'END';
      } else if (page <= 0) {
        vm.pageSelected = 1;
      } else {
        vm.pageSelected = page;
      }
      $location.hash('top');
      $anchorScroll();
    }

    function changePageClick(page) {
      if (vm.pageSelected === vm.lastPage) {
        vm.pageSelected = 'END';
      } else {
        vm.pageSelected = page + 2;
      }
      $location.hash('topRead');
      $anchorScroll();
    }

    // Hotkeys config
    hotkeys.add({
      combo: 'right',
      description: 'Next page',
      callback: function () {
        changePageSelected(vm.pageSelected !== 'END' ? (vm.pageSelected + 1) : null);
      }
    });
    hotkeys.add({
      combo: 'd',
      description: 'Next page',
      callback: function () {
        changePageSelected(vm.pageSelected !== 'END' ? (vm.pageSelected + 1) : null);
      }
    });
    hotkeys.add({
      combo: 'left',
      description: 'Previous page',
      callback: function () {
        changePageSelected(vm.pageSelected !== 'END' ? (vm.pageSelected - 1) : null);
      }
    });
    hotkeys.add({
      combo: 'a',
      description: 'Previous page',
      callback: function () {
        changePageSelected(vm.pageSelected !== 'END' ? (vm.pageSelected - 1) : null);
      }
    });
  }
})();