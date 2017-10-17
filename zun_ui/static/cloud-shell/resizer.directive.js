/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.cloud-shell.resizer', [])
    .directive('resizer', resizer);

  resizer.$inject = ['$document'];

  function resizer($document) {

    var directive = {
      restrict: 'E',
      scope: {
        direction: '@',
        max: '@',
        left: '@',
        right: '@',
        top: '@',
        bottom: '@',
        width: '@',
        height: '@',
        callback: '&'
      },
      link: link
    };

    return directive;

    ////////////////////

    function link($scope, $element) {
      $element.on('mousedown', function(event) {
        event.preventDefault();
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        if ($scope.direction === 'vertical') {
          // Handle vertical resizer
          var x = event.pageX;

          if ($scope.max && x > $scope.max) {
            x = parseInt($scope.max, 10);
          }
          $element.css({
            left: x + 'px'
          });
          $($scope.left).css({
            width: x + 'px'
          });
          $($scope.right).css({
            left: (x + parseInt($scope.width, 10)) + 'px'
          });
        } else {
          // Handle horizontal resizer
          var y = window.innerHeight - event.pageY;
          $element.css({
            bottom: y + 'px'
          });
          $($scope.top).css({
            bottom: (y + parseInt($scope.height, 10)) + 'px'
          });
          $($scope.bottom).css({
            height: y + 'px'
          });
        }
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        if (typeof $scope.callback === "function") {
          $scope.callback();
        }
      }
    }
  }
})();
