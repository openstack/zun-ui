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
    .module('horizon.dashboard.container.capsules')
    .factory('horizon.dashboard.container.capsules.service', capsulesService);

  capsulesService.$inject = [
    'horizon.app.core.detailRoute',
    'horizon.app.core.openstack-service-api.zun'
  ];

  /*
   * @ngdoc factory
   * @name horizon.dashboard.container.capsules.service
   *
   * @description
   * This service provides functions that are used through
   * the capsules of container features.
   */
  function capsulesService(detailRoute, zun) {
    return {
      getCapsulesPromise: getCapsulesPromise
    };

    /*
     * @ngdoc function
     * @name getCapsulesPromise
     * @description
     * Given filter/query parameters, returns a promise for the matching
     * capsules.  This is used in displaying lists of capsules.
     */
    function getCapsulesPromise(params) {
      return zun.getCapsules(params).then(modifyResponse);
    }

    function modifyResponse(response) {
      return {data: {items: response.data.items.map(modifyItem)}};
    }

    function modifyItem(item) {
      item.id = item.uuid;
      item.trackBy = item.uuid;
      item.trackBy = item.trackBy.concat(item.updated_at);
      return item;
    }
  }
})();
