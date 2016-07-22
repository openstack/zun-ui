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
   * @name horizon.dashboard.container.containers
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the container
   * panel
   */
  angular
    .module('horizon.dashboard.container.containers', [
      'ngRoute',
      'horizon.dashboard.container.containers.actions',
      'horizon.dashboard.container.containers.details'
    ])
    .constant('horizon.dashboard.container.containers.events', events())
    .constant('horizon.dashboard.container.containers.resourceType', 'OS::Zun::Container')
    .run(run)
    .config(config);

  /**
   * @ngdoc constant
   * @name horizon.dashboard.container.containers.events
   * @description A list of events used by Container
   */
  function events() {
    return {
      CREATE_SUCCESS: 'horizon.dashboard.container.containers.CREATE_SUCCESS',
      DELETE_SUCCESS: 'horizon.dashboard.container.containers.DELETE_SUCCESS'
    };
  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.basePath',
    'horizon.dashboard.container.containers.resourceType'
  ];

  function run(registry, zun, basePath, resourceType) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Container'), gettext('Containers'))
    // for detail summary view on table row 
    .setSummaryTemplateUrl(basePath + 'details/drawer.html')
    // for table row items and detail summary view.
    .setProperty('name', {
      label: gettext('Name')
    })
    .setProperty('id', {
      label: gettext('ID')
    })
    .setListFunction(listFunction)
    .tableColumns
    .append({
      id: 'name',
      priority: 1,
      sortDefault: true,
      filters: ['noName'],
      urlFunction: urlFunction
    })
    .append({
      id: 'id',
      priority: 2
    });
    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Name'),
      'name': 'name',
      'singleton': true
    })
    .append({
      'label': gettext('ID'),
      'name': 'id',
      'singleton': true
    });

    function listFunction(params) {
      return zun.getContainers(params).then(modifyResponse);

      function modifyResponse(response) {
        return {data: {items: response.data.items.map(addTrackBy)}};

        function addTrackBy(item) {
          item.trackBy = item.id;
          return item;
        }
      }
    }

    function urlFunction(item) {
      return 'project/ngdetails/OS::Zun::Container/' + item.id;
    }
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
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/containers/';
    $provide.constant('horizon.dashboard.container.containers.basePath', path);
    $routeProvider.when('/project/container/containers/', {
      templateUrl: path + 'panel.html'
    });
  }
})();
