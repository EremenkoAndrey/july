/* VERSION 1.0.0
 *
 * Экземпляр этого объекта - контроллер, умеющий слушать события компонентов
 *
 * Пример создания экземпляра:
 * new Component.Controller({
 *      init: function(){
 *          console.log('Controller created!');
 *      }
 * })
 *
 * Определяемая при создании объекта функция init() будет вызвана при создании экземпляра
 *
 * Зависимости:
 * - jQuery
 *
 */

(function (factory) {

    window.Component = factory($);

})(function () {

    var Component = {};

    var Events = {};


// Слушает событие, при срабатывании события вызывает переданную функцию.
// Первый аргумент - название события, строка
// Можно уточнить тип события, указав его через двоеточие: "event:type"
// в этом случае переданная функция будет вызвана только в случае совпадения типа
// Вторым аргументом передается функция,
// которая будет вызвана при срабатывании события
// Последний аргумент - контекст, в котором будет вызвана переданная функция
// Пример использования в компоненте:
// this.listen('change:test', function(){
//  console.log('changed!')
// }, this)
    Events.listen = function (name, method, context) {
        var type = null,
            context = context || null;

        this.listenetrs = this.listenetrs || {};

        if(~name.indexOf(':')) {
            var separatedName = name.split(':', 2);
            name = separatedName[0];
            type = separatedName[1];
        }

        this.listenetrs[name] = this.listenetrs[name] || [];

        var currentLength = this.listenetrs[name].push({
            type: type,
            method: method,
            context: context
        });

        return {
            cleared: false,
            context: this,
            name: name,
            index: currentLength - 1,
            stopListening: function () {
                if(!this.cleared) {
                    this.context.listenetrs[this.name][this.index] = null;
                    this.context = null;
                    this.cleared = true;
                }
            }
        };
    };

// Вызывает событие: пробегает по списку подписчиков и инициирует соответствующие
// методы. Помимо назывнаия события может сообщать его тип через двоеточие.
// Пример:
// this.emit('change:test');
// Аргументы:
// name (строка) - название события
// data - произвольные данные, которые будут переданы в качестве аргумента вызываемому
// методу
    Events.emit = function (name, data) {
        var type = null;
        this.listenetrs = this.listenetrs || {};

        if(~name.indexOf(':')) {
            var separatedName = name.split(':', 2);
            name = separatedName[0];
            type = separatedName[1];
        }

        if (!this.listenetrs[name])
            return;

        var listeners = this.listenetrs[name];

        for (var i = 0, max = listeners.length; i < max; i++) {
            if (!listeners[i] ||
                (listeners[i].type !== null && listeners[i].type !== type)
            ) continue;

            // Если контекст не передан, выполнить функцию в глобальном объекте
            var context = listeners[i].context || window;

            if (data !== undefined) {
                listeners[i].method.call(context, data);
            } else {
                listeners[i].method.call(context);
            }
        }
    };

// DEPRECATED!
// Следует использовать вместо .on метод .listen в связке с .emit
    Events.on = function (name) {

        if (typeof (name) !== 'string')
            throw new Error('Incorrect listener arguments');

        var newListener = {};

        if (arguments.length < 4) {
            // Если второй аргумент строка - значит передан тип, в противном случае тип не указан
            newListener.type = (typeof (arguments[1]) === 'string') ? arguments[1] : null;
            // Если второй аргумент функция - значит тип не указан
            newListener.method = (typeof (arguments[1]) === 'function') ? arguments[1] : arguments[2];
            // Если последний аргумент - это не калбэк, значит это контекст
            newListener.context = (arguments[arguments.length - 1] !== newListener.method) ? arguments[arguments.length - 1] : null;

        } else if (arguments.length === 4) {
            newListener.type = arguments[1];
            newListener.method = arguments[2];
            newListener.context = arguments[3];

        } else {
            throw new Error('Incorrect listener arguments');
        }

        if (typeof (newListener.method) !== 'function') {
            throw new Error('Callback ' + name + ' is not a function');
        }

        this.listenetrs = this.listenetrs || {};

        this.listenetrs[name] = this.listenetrs[name] || [];

        this.listenetrs[name].push(newListener);

    };

// DEPRECATED!
// Следует использовать вместо .trigger метод .emit в связке с .listen
    Events.trigger = function (name, type, data) {
        this.listenetrs = this.listenetrs || {};

        if (!this.listenetrs[name])
            return;
        var listeners = this.listenetrs[name];

        for (var i = 0, max = listeners.length; i < max; i++) {
            if (listeners[i].type !== null && listeners[i].type !== type) {
                continue;
            }
            // Если контекст не передан, выполнить функцию в глобальном объекте
            var context = listeners[i].context || window;

            if (data !== undefined) {
                listeners[i].method.call(context, data);
            } else {
                listeners[i].method.call(context);
            }
        }
    };

    var Controller = Component.Controller = function () {
        var func;

        if (arguments.length > 1) {
            this.$el = arguments[0];
            func = arguments[1];
        } else {
            this.$el = $(document);
            func = arguments[0];
        }
        this.dependencies = {};

        this.findBlocks(this.$el);

        this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());

        func.apply(this);

    };

    Controller.blocks = {};
    Controller.components = {};

// Если для компонента есть ожидающий его блок, то блок активируется с этим
// компонентом и удяляется из очереди
    Controller.createClassInstanses = function (componentName) {

        if (Controller.blocks[componentName] &&
            Controller.components[componentName]) {

            var blocks = Controller.blocks[componentName],
                componentClass = Controller.components[componentName];

            for (var i = 0, max = blocks.length; i < max; i++) {
                componentClass.instancesCount = componentClass.instancesCount + 1;
                var clearedEl = blocks[i].$el.get(0),
                    options = clearedEl.onclick ? clearedEl.onclick() : {},
                    instId = componentName + componentClass.instancesCount;
                new componentClass(blocks[i].$el, blocks[i].controller, options, instId);
                // Очистить переданные параметры
                if (clearedEl.onclick) {
                    clearedEl.onclick = null;
                    clearedEl.removeAttribute('onclick');
                }
            }
            Controller.blocks[componentName] = [];

        }

    };
// Регистрирует компонент в общем массиве всей компонентов
    Controller.registerComponent = function (name, Component) {

        if (!Controller.components[name]) {
            Controller.components[name] = Component;
        }

        Controller.createClassInstanses(name);
    };

// Сообщает всем подписчикам об инициализации компонента
    Controller.prototype.reportComponentInited = function (instanceId) {
        var dependencies = this.dependencies[instanceId];

        if (!dependencies) {
            dependencies = 'inited';
        } else if (Array.isArray(dependencies)) {
            dependencies.forEach(function (instanceFunction) {
                instanceFunction(instanceId);
            });
            dependencies = 'inited';
        }
    };

// Ищет на страницах блоки, связанные с определенными компонентами
// и сохраняет их и ссылку на свой экземпляр
// в ассоциативном массиве Controller.blocks
    Controller.prototype.findBlocks = function ($object) {
        var __self = this,
            name,
            loadUrl,
            $item,
            $elements;

        $elements = ($object.get(0) === document) ? $('[data-component]') : $object.find('[data-component]');

        for (var i = 0, max = $elements.length; i < max; i++) {

            $item = $elements.eq(i);

            if ($item.data('inited')) {
                continue;
            }

            name = $item.data('component');
            loadUrl = $item.data('component-load');

            if (!Controller.blocks[name]) {
                Controller.blocks[name] = [];
            }

            Controller.blocks[name].push({
                $el: $item,
                controller: __self
            });

            // Если трубется загрузка скрипта
            if (loadUrl) {
                this.loadScript(loadUrl, name);
                continue;
            }

            Controller.createClassInstanses(name);
        }
    };

    Controller.prototype.loadScript = function (url, name) {
        // Если компонент уже загружен - создать экземпляр и выйти
        if (typeof (Controller.components[name]) === 'function') {
            Controller.createClassInstanses(name);
            return;
        }

        // иначе загрузить
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        script.async = true;
        script.src = url;
        head.appendChild(script);
        script.onerror = function (error) {
            console.error('Component ' + name + ' is not found in ' + url);
        };
    };


// Изменяет собственное свойство объекта, при его наличии.
// При изменении срабатывает событие 'change' с типом соответствующим
// имени изменяемого свойства
// Аргументы:
// propObj - объект, в котором перечислены свойства и их устанавливаемые значения
// silence - булево значение, не обязательно, если передать true, событие не сработает
// Пример:
// this.set({'proper': 6});
// Установит в свойство this.proper значение 6
// сгенерирует событие 'change' с типом 'proper'

    Controller.prototype.set = function (propObj, silence) {

        if (typeof (propObj) !== 'object')
            throw Error('Incorrect set argument');

        for (var prop in propObj) {
            if (!propObj.hasOwnProperty(prop))
                continue;

            if (this[prop] !== propObj[prop]) {
                this[prop] = propObj[prop];
            } else {
                silence = true;
            }

            if (!silence) {
                this.emit('change:' + prop, propObj[prop]);
                this.trigger('change', prop, propObj[prop]);
            }
        }
    };

    /*
     * Объект, предназначенный для передачи наследованием его свойств создаваемым
     * компонентам.
     *
     * Пример вызова:
     * Component.create('MainMenu', {
     *  init: function(){
     *      console.log('Компонент MainMenu инициирован!');
     *  }
     * });
     *
     * Зависимости:
     * - Overlay.js
     * - Controller.js
     * - jQuery
     */


// Функция создает новый компонент.
// первый аргумент - строка с названием компонента,
// второй аргумент - объект с методами нового объекта
    Component.create = function (name, methods) {

        var NewClass = function (block, controller, options, instId) {
            this.controller = controller;
            this.instId = options.instId || instId;
            this.$el = block.jquery ? block : $(block);
            this.el = this.$el.get(0);
            if (this.$el.length > 1) {
                this.$el = $(this.el);
            }
            this.$el.data('inited', true);

            this.options = options || {};
            if (this.events.length > 0) {
                this.bindingEvent(this.events);
            }

            if (this.options.dependence) {
                // Если передана строка, то преобразовать к массиву
                if (typeof (this.options.dependence) === 'string') {
                    var depString = this.options.dependence;
                    this.options.dependence = [];
                    this.options.dependence.push(depString);
                }
                // Собираем массив компонентов-зависимостей, которые еще не инициализированы
                var arrNoInitedDeps = this.options.dependence.filter(function (instId) {
                    return this.controller[instId] !== 'inited';
                }.bind(this));


                if (arrNoInitedDeps.length === 0) {
                    initComponent.apply(this);
                } else {
                    dependenceManager(this, controller).init();

                }

            } else {
                initComponent.apply(this);
            }

            function initComponent() {
                this.init();
                this.controller.reportComponentInited(this.instId);
            }

            // Функция возвращает объект, управляющий зависимостями
            function dependenceManager(context, controller) {

                var manager = {};

                // Записывает метод dependenceManager.checkWithout в контроллер
                manager.init = function () {
                    arrNoInitedDeps.forEach(function (instId) {

                        if (!controller.dependencies[instId]) {
                            controller.dependencies[instId] = [];
                        }
                        controller.dependencies[instId].push(manager.checkWithout);

                    });
                };

                // Получает instId компонента и удаляет его из списка зависимостей
                // Если после этого список зависимостей становится пустым - инициализирует
                // компонент
                manager.checkWithout = function (instId) {
                    var index = arrNoInitedDeps.findIndex(function (item) {
                        return item === instId;
                    });

                    if (index !== -1) {
                        arrNoInitedDeps.splice(index, 1);
                    }

                    if (arrNoInitedDeps.length === 0) {
                        initComponent.apply(context);
                    }

                };

                return manager;
            }

        };

        var protoProp = $.extend(NewClass.prototype, Component, methods, {componentName: name});
        NewClass.prototype = protoProp;
        NewClass.prototype.constructor = Component;
        NewClass.instancesCount = 0;
        Controller.registerComponent(name, NewClass);

        return NewClass;
    };


// Пустая функция, которая будет вызвана в случае, если ее не переопределить
    Component.init = function () {};
    Component.events = [];
// Вешает на корневой элемент событие, имя которого передается в аргументе
// в дальнейшем обработка этого собятия делегируется с вложенных элементов, у которых декларативно
// определен обработчик в свойстве data-имяСобытия
// Обязательный аргумент events - строка с именем события или объект с именами событий
// Например, строка 'click' сообщит о наличии в компоненте элемента с data-click
    Component.bindingEvent = function (events) {
        for (var i = 0, max = events.length; i < max; i++) {
            this.$el.on(events[i], function (e) {
                this.dataEvent(e, this);
            }.bind(this));
        }
    };

// Обрабатывает декларативно заданные в шаблоне события
// Аргументы: event - объект события, context - объект, в контексте которого
// должен вызываться метод, который получит в аргументах jquery-объект события и
// ссылку на элемент, вызвавший срабатывание события
    Component.dataEvent = function ($event, context) {
        var target = $event.target,
            bindObj = context || this,
            events = [];

        while (target !== this.el) {
            if ($(target).data()[$event.type]) {
                events.push({
                    method: $(target).data()[$event.type],
                    target: target
                });
            }
            target = $(target).parent().get(0);
        }
        if (!events.length)
            return;

        for (var i = 0, max = events.length; i < max; i++) {
            tryOnMethods(events[i], bindObj);
        }

        // Пробует вызвать переданные в строке методы
        // Получает в 1 аргументе объект с названиями методов и ссылками на элемент,
        // вызвавший срабатывание события
        // во втором аргументе - объект, в контексте которого попробовать вызвать метод
        function tryOnMethods(dataFromEventElem, context) {
            var methods = dataFromEventElem.method.split(/\s+/);

            for (var i = 0, max = methods.length; i < max; i++) {
                if (context[methods[i]]) {
                    context[methods[i]]($event, dataFromEventElem.target);
                }
            }
        }
    };

    $.extend(Component, Events);
    $.extend(Controller.prototype, Events);

    return Component;
});


// Полифиллы

if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

