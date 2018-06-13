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
      getDetailsPath: getDetailsPath,
      getCapsulePromise: getCapsulePromise,
      getCapsulesPromise: getCapsulesPromise
    };

    /*
     * @ngdoc function
     * @name getDetailsPath
     * @param item {Object} - The capsule object
     * @description
     * Returns the relative path to the details view.
     */
    function getDetailsPath(item) {
      return detailRoute + 'OS::Zun::Capsule/' + item.id;
    }

    /*
     * @ngdoc function
     * @name getCapsulePromise
     * @description
     * Given an id, returns a promise for the capsule data.
     */
    function getCapsulePromise(identifier) {
      return zun.getCapsule(identifier).then(modifyDetails);
    }

    function modifyDetails(response) {
      return {data: modifyItem(response.data)};
    }

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
      item.name = item.meta_name;
      item.capsule_id = item.id;
      item.id = item.uuid ? item.uuid : item.capsule_id;
      item.trackBy = item.id.concat(item.updated_at);
      return item;
    }
  }
})();
