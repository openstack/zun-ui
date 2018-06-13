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
   * @ngdoc factory
   * @name horizon.dashboard.container.images.workflow
   * @description
   * Workflow for pulling image
   */
  angular
    .module('horizon.dashboard.container.images.actions')
    .factory('horizon.dashboard.container.images.actions.workflow', workflow);

  workflow.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.framework.util.i18n.gettext'
  ];

  function workflow(zun, gettext) {
    var workflow = {
      init: init
    };

    function init(actionType, title, submitText) {
      var push = Array.prototype.push;
      var schema, form, model;
      var hosts = [
        {value: "", name: gettext("Select host that stores the image.")}
      ];

      // schema
      schema = {
        type: 'object',
        properties: {
          repo: {
            title: gettext('Image'),
            type: 'string'
          },
          host: {
            title: gettext('Host'),
            type: 'string'
          }
        }
      };

      // form
      form = [
        {
          type: 'section',
          htmlClass: 'row',
          items: [
            {
              type: 'section',
              htmlClass: 'col-sm-12',
              items: [
                {
                  key: 'repo',
                  placeholder: gettext('Name of the image.'),
                  required: true
                },
                {
                  key: 'host',
                  type: "select",
                  titleMap: hosts,
                  required: true
                }
              ]
            }
          ]
        }
      ]; // form

      model = {
        repo: '',
        host: ''
      };

      // get hosts for zun
      zun.getHosts().then(onGetZunHosts);
      function onGetZunHosts(response) {
        var hs = [];
        response.data.items.forEach(function (host) {
          hs.push({value: host.id, name: host.hostname});
        });
        push.apply(hosts, hs);
      }

      var config = {
        title: title,
        submitText: submitText,
        schema: schema,
        form: form,
        model: model
      };

      return config;
    }

    return workflow;
  }
})();
