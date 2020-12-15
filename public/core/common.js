/** JavaScript Document for common functions
 * Created by Jerome Robbins on 2020-03-03. */

function node(js) {
    const script = document.getElementsByTagName('script')[0];
    script.parentNode.insertBefore(js, script);
}