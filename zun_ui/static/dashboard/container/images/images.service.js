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
    .module('horizon.dashboard.container.images')
    .factory('horizon.dashboard.container.images.service', imagesService);

  imagesService.$inject = [
    'horizon.app.core.detailRoute',
    'horizon.app.core.openstack-service-api.zun'
  ];

  /*
   * @ngdoc factory
   * @name horizon.dashboard.container.images.service
   *
   * @description
   * This service provides functions that are used through
   * the images of container features.
   */
  function imagesService(detailRoute, zun) {
    return {
      getImagesPromise: getImagesPromise
    };

    /*
     * @ngdoc function
     * @name getImagesPromise
     * @description
     * Given filter/query parameters, returns a promise for the matching
     * images.  This is used in displaying lists of images.
     */
    function getImagesPromise(params) {
      return zun.getImages(params).then(modifyResponse);
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
