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
   * @name horizon.dashboard.container.hosts
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the hosts
   * panel
   */
  angular
    .module('horizon.dashboard.container.hosts', [
      'ngRoute',
      'horizon.dashboard.container.hosts.details'
    ])
    .constant('horizon.dashboard.container.hosts.resourceType', 'OS::Zun::Host')
    .run(run)
    .config(config);

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.hosts.basePath',
    'horizon.dashboard.container.hosts.resourceType',
    'horizon.dashboard.container.hosts.service'
  ];

  function run(registry, zun, basePath, resourceType, hostService) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Host'), gettext('Hosts'))
    // for detail summary view on table row.
    .setSummaryTemplateUrl(basePath + 'drawer.html')
    // for table row items and detail summary view.
    .setDefaultIndexUrl('/admin/container/hosts/')
    .setProperties(hostProperties())
    .setListFunction(hostService.getHostsPromise)
    .tableColumns
    .append({
      id: 'id',
      priority: 3
    })
    .append({
      id: 'hostname',
      priority: 1,
      sortDefault: true,
      urlFunction: hostService.getDetailsPath
    })
    .append({
      id: 'mem_total',
      priority: 2
    })
    .append({
      id: 'cpus',
      priority: 2
    })
    .append({
      id: 'disk_total',
      priority: 2
    });
    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Hostname'),
      'name': 'repo',
      'singleton': true
    })
    .append({
      'label': gettext('ID'),
      'name': 'id',
      'singleton': true
    });
  }

  function hostProperties() {
    return {
      'id': {label: gettext('ID'), filters: ['noValue'] },
      'hostname': { label: gettext('Hostname'), filters: ['noValue'] },
      'mem_total': { label: gettext('Memory Total'), filters: ['noValue', 'mb'] },
      'mem_used': { label: gettext('Memory Used'), filters: ['noValue', 'mb'] },
      'cpus': { label: gettext('CPU Total'), filters: ['noValue'] },
      'cpu_used': { label: gettext('CPU Used'), filters: ['noValue'] },
      'disk_total': { label: gettext('Disk Total'), filters: ['noValue', 'gb'] },
      'disk_used': { label: gettext('Disk Used'), filters: ['noValue', 'gb'] },
      'disk_quota_supported': { label: gettext('Disk Quota Supported'),
        filters: ['noValue', 'yesno'] },
      'total_containers': { label: gettext('Total Containers'), filters: ['noValue'] },
      'os': { label: gettext('OS'), filters: ['noValue'] },
      'os_type': { label: gettext('OS Type'), filters: ['noValue'] },
      'architecture': { label: gettext('Architecture'), filters: ['noValue'] },
      'kernel_version': { label: gettext('Kernel Version'), filters: ['noValue'] },
      'runtimes': { label: gettext('Runtimes'), filters: ['noValue', 'json'] },
      'labels': { label: gettext('Labels'), filters: ['noValue', 'json'] },
      'links': { label: gettext('Links'), filters: ['noValue', 'json'] }
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
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/container/hosts/';
    $provide.constant('horizon.dashboard.container.hosts.basePath', path);
    $routeProvider.when('/admin/container/hosts', {
      templateUrl: path + 'panel.html'
    });
  }
})();
