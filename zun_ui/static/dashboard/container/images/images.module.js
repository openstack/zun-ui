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
   * @name horizon.dashboard.container.images
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the images
   * panel
   */
  angular
    .module('horizon.dashboard.container.images', [
      'ngRoute',
      'horizon.dashboard.container.images.actions'
    ])
    .constant('horizon.dashboard.container.images.events', events())
    .constant('horizon.dashboard.container.images.resourceType', 'OS::Zun::Image')
    .run(run)
    .config(config);

  /**
   * @ngdoc constant
   * @name horizon.dashboard.container.images.events
   * @description A list of events used by Images
   * @returns {Object} Event constants
   */
  function events() {
    return {
      CREATE_SUCCESS: 'horizon.dashboard.container.images.CREATE_SUCCESS',
      DELETE_SUCCESS: 'horizon.dashboard.container.images.DELETE_SUCCESS'
    };
  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.images.basePath',
    'horizon.dashboard.container.images.resourceType',
    'horizon.dashboard.container.images.service'
  ];

  function run(registry, zun, basePath, resourceType, imageService) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Image'), gettext('Images'))
    // for detail summary view on table row.
    .setSummaryTemplateUrl(basePath + 'drawer.html')
    .setDefaultIndexUrl('/admin/container/images/')
    // for table row items and detail summary view.
    .setProperties(imageProperties())
    .setListFunction(imageService.getImagesPromise)
    .tableColumns
    .append({
      id: 'id',
      priority: 2
    })
    .append({
      id: 'repo',
      priority: 1,
      sortDefault: true
    })
    .append({
      id: 'tag',
      priority: 1
    })
    .append({
      id: 'size',
      priority: 1
    })
    .append({
      id: 'host',
      priority: 1
    })
    .append({
      id: 'image_id',
      priority: 3
    })
    .append({
      id: 'project_id',
      priority: 2
    });
    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Image'),
      'name': 'repo',
      'singleton': true
    })
    .append({
      'label': gettext('Tag'),
      'name': 'tag',
      'singleton': true
    })
    .append({
      'label': gettext('Host'),
      'name': 'host',
      'singleton': true
    })
    .append({
      'label': gettext('ID'),
      'name': 'id',
      'singleton': true
    })
    .append({
      'label': gettext('Image ID'),
      'name': 'image_id',
      'singleton': true
    })
    .append({
      'label': gettext('Project ID'),
      'name': 'project_id',
      'singleton': true
    });
  }

  function imageProperties() {
    return {
      'id': {label: gettext('ID'), filters: ['noValue'] },
      'repo': { label: gettext('Image'), filters: ['noValue'] },
      'tag': { label: gettext('Tag'), filters: ['noValue'] },
      'host': { label: gettext('Host'), filters: ['noValue'] },
      'size': { label: gettext('Size'), filters: ['noValue', 'bytes'] },
      'image_id': { label: gettext('Image ID'), filters: ['noValue'] },
      'project_id': { label: gettext('Project ID'), filters: ['noValue'] }
    };
  }

  config.$inject = [
    '$provide',
    '$windowProvider',
    '$routeProvider'
  ];

  /**
   * @name config
   * @param {Object} $provide
   * @param {Object} $windowProvider
   * @param {Object} $routeProvider
   * @description Routes used by this module.
   * @returns {undefined} Returns nothing
   */
  function config($provide, $windowProvider, $routeProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/images/';
    $provide.constant('horizon.dashboard.container.images.basePath', path);
    $routeProvider.when('/admin/container/images', {
      templateUrl: path + 'panel.html'
    });
  }
})();
