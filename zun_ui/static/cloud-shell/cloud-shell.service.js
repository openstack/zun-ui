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
  "use strict";

  angular
    .module('horizon.cloud-shell')
    .factory('horizon.cloud-shell.service', cloudShellService);

  cloudShellService.$inject = [
    '$rootScope',
    '$templateRequest',
    'horizon.cloud-shell.basePath'
  ];

  function cloudShellService(
    $rootScope,
    $templateRequest,
    basePath
  ) {

    var service = {
      init: init
    };

    return service;

    function init () {
      // remove existing cloud shell
      angular.element(".cloud_shell").remove();

      // load html for cloud shell
      $templateRequest(basePath + 'cloud-shell.html').then(function (html) {
        var scope = $rootScope.$new();
        var template = angular.element(html);
        // compile html
        angular.element(document.body).injector().invoke(['$compile', function ($compile) {
          $compile(template)(scope);
          angular.element('body').append(template);
        }]);
      });
    }
  }
})();
