# sailfish [![Build Status](https://travis-ci.org/ershov-konst/sailfish.png)](https://travis-ci.org/ershov-konst/sailfish) [![Dependency Status](https://david-dm.org/ershov-konst/sailfish.png?theme=shields.io)](https://david-dm.org/ershov-konst/sailfish) [![devDependency Status](https://david-dm.org/ershov-konst/sailfish/dev-status.png?theme=shields.io)](https://david-dm.org/ershov-konst/sailfish#info=devDependencies)

sailfish - это фремворк для создания web-приложений на JavaScript. Фреймворк является самодостаточным,
т.е содержит в себе как серверную так и клиентскую части.

## frontend
Фреймворк позволяет разделять frontend часть приложения на отдельные компоненты. Компонент увязывает в себе разметку (html),
её визуальное оформление (css) и поведение(js). Компонент может быть "невизуальным", и представлять из себя js-модуль предоставляющий наружу некоторое api.
Визуальные компоненты могут содержать другие компоненты и управлять их поведением. Все компоненты переиспользуемые,
т.е могут встречаться на странице множество раз.

## backend
Серверная часть фремворка реализует роутинг, который позволяет собирать страницы с различным набором компонентов в зависимости от запроса.
Помимо этого сервер выступает в роли "real time сборщика", т.к возвращает на клиент готовый html, собранные и сжатые js,
css пакеты содержащие в себе модули, необходимые только для запрашиваемой страницы.

## example
[Исходный код сайта доментации sailfish](https://github.com/ershov-konst/sailfish/tree/master/example)

## more info
[http://sailfish-docs.herokuapp.com/](http://sailfish-docs.herokuapp.com/)
