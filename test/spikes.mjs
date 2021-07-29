/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import ServiceFacade  from "/thoregon.crystalline/lib/servicefacade.mjs";
import WorkerProvider from "/thoregon.crystalline/lib/providers/workerprovider.mjs";

(async () => {

    try {
        const srv = await ServiceFacade.use(await WorkerProvider.from('/thoregon.crystalline/test/services/simplejs.mjs'));

        let result = await srv.doit();
        console.log("service:", result);

        result = await srv.oneParam(0);
        console.log("service:", result);

        result = await srv.twoParam(true, '$');
        console.log("service:", result);

        srv.subscribe('change', (evt) => {
            console.log(evt);
        });

        let a = await srv.a;
        console.log("service a:", a);
        let b = await srv.b;
        console.log("1 service b:", b);
        srv.b = 'X';
        b     = await srv.b;
        console.log("2 service b:", b);
    } catch (e) {
        console.log(">> Error", e);
    }
})();


/*
import ServiceFacade from "/thoregon.crystalline/lib/servicefacade.mjs";
import JSProvider    from "/thoregon.crystalline/lib/providers/jsprovider.mjs";
import SimpleJS      from "/thoregon.crystalline/test/services/simplejs.mjs";


(async () => {
    debugger;
    const srv = await ServiceFacade.use(await JSProvider.with(new SimpleJS()));

    let result = await srv.doit();
    console.log("service:", result);

    result = await srv.oneParam(0);
    console.log("service:", result);

    result = await srv.twoParam(true, '$');
    console.log("service:", result);

    let a = await srv.a;
    console.log("service a:", a);
    let b = await srv.b;
    console.log("1 service b:", b);
    srv.b = 'X';
    b = await srv.b;
    console.log("2 service b:", b);
})();
*/
