/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('horizon.dashboard.container.containers')
    .factory('horizon.dashboard.container.containers.service', containersService);

  containersService.$inject = [
    '$location',
    'horizon.app.core.detailRoute',
    'horizon.app.core.openstack-service-api.zun',
  ];

  /*
   * @ngdoc factory
   * @name horizon.cluster.containers.service
   *
   * @description
   * This service provides functions that are used through
   * the containers features.
   */
  function containersService($location, detailRoute, zun) {
    return {
      getDefaultIndexUrl: getDefaultIndexUrl,
      getDetailsPath: getDetailsPath,
      getContainerPromise: getContainerPromise,
      getContainersPromise: getContainersPromise
    };

    function getDefaultIndexUrl() {
      var dashboard;
      var path = "/container/containers";
      if (zun.isAdmin()) {
        dashboard = "/admin";
      } else {
        dashboard = "/project";
      }
      var url = dashboard + path + "/";
      return url;
    }
    /*
     * @ngdoc function
     * @name getDetailsPath
     * @param item {Object} - The container object
     * @description
     * Returns the relative path to the details view.
     */
    function getDetailsPath(item) {
      var detailsPath = detailRoute + 'OS::Zun::Container/' + item.id;
      if ($location.url() === '/admin/container/containers') {
        detailsPath = detailsPath + "?nav=/admin/container/containers/";
      }
      return detailsPath;
    }

    /*
     * @ngdoc function
     * @name getContainerPromise
     * @description
     * Given an id, returns a promise for the container data.
     */
    function getContainerPromise(identifier) {
      return zun.getContainer(identifier);
    }

    /*
     * @ngdoc function
     * @name getContainersPromise
     * @description
     * Given filter/query parameters, returns a promise for the matching
     * containers.  This is used in displaying lists of containers.
     */
    function getContainersPromise(params) {
      return zun.getContainers(params).then(modifyResponse);
    }

    function modifyResponse(response) {
      return {data: {items: response.data.items.map(modifyItem)}};

      function modifyItem(item) {
        var timestamp = new Date();
        item.trackBy = item.id.concat(timestamp.getTime());
        return item;
      }
    }
  }
})();
