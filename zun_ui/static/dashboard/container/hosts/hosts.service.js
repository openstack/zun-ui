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
    .module('horizon.dashboard.container.hosts')
    .factory('horizon.dashboard.container.hosts.service', hostsService);

  hostsService.$inject = [
    'horizon.app.core.detailRoute',
    'horizon.app.core.openstack-service-api.zun'
  ];

  /*
   * @ngdoc factory
   * @name horizon.dashboard.container.hosts.service
   *
   * @description
   * This service provides functions that are used through
   * the hosts of container features.
   */
  function hostsService(detailRoute, zun) {
    return {
      getDetailsPath: getDetailsPath,
      getHostsPromise: getHostsPromise,
      getHostPromise: getHostPromise
    };

    /*
     * @ngdoc function
     * @name getDetailsPath
     * @param item {Object} - The host object
     * @description
     * Returns the relative path to the details view.
     */
    function getDetailsPath(item) {
      return detailRoute + 'OS::Zun::Host/' + item.id;
    }

    /*
     * @ngdoc function
     * @name getHostPromise
     * @description
     * Given an id, returns a promise for the host data.
     */
    function getHostPromise(identifier) {
      return zun.getHost(identifier).then(modifyDetails);
    }

    function modifyDetails(response) {
      return {data: modifyItem(response.data)};
    }

    /*
     * @ngdoc function
     * @name getHostsPromise
     * @description
     * Given filter/query parameters, returns a promise for the matching
     * hosts.  This is used in displaying lists of hosts.
     */
    function getHostsPromise(params) {
      return zun.getHosts(params).then(modifyResponse);
    }

    function modifyResponse(response) {
      return {data: {items: response.data.items.map(modifyItem)}};
    }

    function modifyItem(item) {
      var timestamp = new Date();
      item.trackBy = item.id.concat(timestamp.getTime());
      return item;
    }
  }
})();
