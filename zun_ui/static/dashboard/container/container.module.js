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

  /**
   * @ngdoc overview
   * @name horizon.dashboard.container
   * @description
   * Dashboard module to host various container panels.
   */
  angular
    .module('horizon.dashboard.container', [
      'horizon.dashboard.container.containers',
      'horizon.dashboard.container.capsules',
      'horizon.dashboard.container.images',
      'horizon.dashboard.container.hosts',
      'ngRoute'
    ])
    .config(config);

  config.$inject = ['$provide', '$windowProvider'];

  function config($provide, $windowProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/';
    var root = $windowProvider.$get().WEBROOT + 'project/container/';
    $provide.constant('horizon.dashboard.container.basePath', path);
    $provide.constant('horizon.dashboard.container.webRoot', root);
  }
})();
