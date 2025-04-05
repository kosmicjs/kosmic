/**
 * This file is used for importing all the scripts that are used in the application.
 *
 * This file is the main entry point for the frontend application and vite bundler.
 *
 * Note: order does matter here if you set some type of global functionallity
 */
import 'vite/modulepreload-polyfill';
import '@popperjs/core';
// Import all of Bootstrap's JS
import '../styles/styles.scss';
// eslint-disable-next-line import-x/order
import 'highlight.js/styles/base16/dracula.css';
// We can then use query syntax in other scripts
import './htmx.js';
