/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

/******************************************************************/
/* ThoregonEntity delete collection in property                   */
/******************************************************************/

import ThoregonEntity       from "/thoregon.archetim/lib/thoregonentity.mjs";
// import MetaClass            from "/thoregon.archetim/lib/metaclass/metaclass.mjs";

class TestBOMeta extends MetaClass {

    initiateInstance() {
        this.name = "TestBO";

        this.text("a");
        this.object("b");

        this.event("cancommit", function () { return  this.a != undefined });
    }

}

"@ThoregonEntity"
class TestA extends ThoregonEntity() {
    "@AttributeText({ name: 'a' })"
    "@AttributeObject({ name: 'b' })"

    constructor(props) {
        super();
        Object.assign(this, props);
    }


}

TestBO.checkIn(import.meta, TestBOMeta);


class TestB extends ThoregonEntity() {
    "@AttributeText({ name: 'x', defaultValue: 'X' })"
    "@AttributeCollection({ name: 'y', cls: '/thoregon.archetim/lib/Collection.mjs' })"

    constructor(props) {
        super();
        Object.assign(this, props);
    }


}

