/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
(function(b) {
    var a = function(e) {
        var c = b.Deferred(),
            d = new FileReader();
        d.onload = function(f) {
            c.resolve(f.target.result)
        };
        d.onerror = c.reject;
        d.onprogress = c.notify;
        d.readAsDataURL(e);
        return c.promise()
    };
    b.fn.cleanHtml = function() {
        var c = b(this).html();
        return c && c.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, "")
    };
    b.fn.wysiwyg = function(k) {
        var l = this,
            h,
            q,
            d,
            p = function() {
                if (q.activeToolbarClass) {
                    b(q.toolbarSelector).find(d).each(function() {
                        try {
                            var s = b(this).data(q.commandRole);
                            if (document.queryCommandState(s)) {
                                b(this).addClass(q.activeToolbarClass)
                            } else {
                                b(this).removeClass(q.activeToolbarClass)
                            }
                        } catch(r) {}
                    })
                }
            },
            o = function(r, s) {
                var u = r.split(" "),
                    v = u.shift(),
                    t = u.join(" ") + (s || "");
                document.execCommand(v, 0, t);
                p()
            },
            f = function(r) {
                b.each(r,
                    function(s, t) {
                        l.keydown(s,
                            function(u) {
                                if (l.attr("contenteditable") && l.is(":visible")) {
                                    u.preventDefault();
                                    u.stopPropagation();
                                    o(t)
                                }
                            }).keyup(s,
                            function(u) {
                                if (l.attr("contenteditable") && l.is(":visible")) {
                                    u.preventDefault();
                                    u.stopPropagation()
                                }
                            })
                    })
            },
            g = function() {
                try {
                    var r = window.getSelection();
                    if (r.getRangeAt && r.rangeCount) {
                        return r.getRangeAt(0)
                    }
                } catch(s) {}
            },
            i = function() {
                h = g()
            },
            e = function() {
                try {
                    var s = window.getSelection();
                    if (h) {
                        try {
                            s.removeAllRanges()
                        } catch(r) {
                            document.body.createTextRange().select();
                            document.selection.empty()
                        }
                        s.addRange(h)
                    }
                } catch(t) {}
            },
            j = function(r) {
                l.focus();
                b.each(r,
                    function(s, t) {
                        if (/^image\//.test(t.type)) {
                            b.when(a(t)).done(function(u) {
                                o("insertimage", u)
                            }).fail(function(u) {
                                q.fileUploadError("file-reader", u)
                            })
                        } else {
                            q.fileUploadError("unsupported-file-type", t.type)
                        }
                    })
            },
            c = function(s, r) {
                e();
                if (document.queryCommandSupported("hiliteColor")) {
                    document.execCommand("hiliteColor", 0, r || "transparent")
                }
                i();
                s.data(q.selectionMarker, r)
            },
            m = function(t, s) {
                t.find(d).click(function() {
                    e();
                    l.focus();
                    o(b(this).data(s.commandRole));
                    i()
                });
                t.find("[data-toggle=dropdown]").click(e);
                var r = !!window.navigator.msPointerEnabled || ( !! document.all && !!document.addEventListener);
                t.find("input[type=text][data-" + s.commandRole + "]").on("webkitspeechchange change",
                    function() {
                        var u = this.value;
                        this.value = "";
                        e();
                        if (u) {
                            l.focus();
                            o(b(this).data(s.commandRole), u)
                        }
                        i()
                    }).on("focus",
                    function() {
                        if (r) {
                            return
                        }
                        var u = b(this);
                        if (!u.data(s.selectionMarker)) {
                            c(u, s.selectionColor);
                            u.focus()
                        }
                    }).on("blur",
                    function() {
                        if (r) {
                            return
                        }
                        var u = b(this);
                        if (u.data(s.selectionMarker)) {
                            c(u, false)
                        }
                    });
                t.find("input[type=file][data-" + s.commandRole + "]").change(function() {
                    e();
                    if (this.type === "file" && this.files && this.files.length > 0) {
                        j(this.files)
                    }
                    i();
                    this.value = ""
                })
            },
            n = function() {
                l.on("dragenter dragover", false).on("drop",
                    function(s) {
                        var r = s.originalEvent.dataTransfer;
                        s.stopPropagation();
                        s.preventDefault();
                        if (r && r.files && r.files.length > 0) {
                            j(r.files)
                        }
                    })
            };
        q = b.extend({},
            b.fn.wysiwyg.defaults, k);
        d = "a[data-" + q.commandRole + "],button[data-" + q.commandRole + "],input[type=button][data-" + q.commandRole + "]";
        f(q.hotKeys);
        if (q.dragAndDropImages) {
            n()
        }
        m(b(q.toolbarSelector), q);
        l.attr("contenteditable", true).on("mouseup keyup mouseout",
            function() {
                i();
                p()
            });
        b(window).bind("touchend",
            function(u) {
                var t = (l.is(u.target) || l.has(u.target).length > 0),
                    s = g(),
                    r = s && (s.startContainer === s.endContainer && s.startOffset === s.endOffset);
                if (!r || t) {
                    i();
                    p()
                }
            });
        return this
    };
    b.fn.wysiwyg.defaults = {
        hotKeys: {
            "ctrl+b meta+b": "bold",
            "ctrl+i meta+i": "italic",
            "ctrl+u meta+u": "underline",
            "ctrl+z meta+z": "undo",
            "ctrl+y meta+y meta+shift+z": "redo",
            "ctrl+l meta+l": "justifyleft",
            "ctrl+r meta+r": "justifyright",
            "ctrl+e meta+e": "justifycenter",
            "ctrl+j meta+j": "justifyfull",
            "shift+tab": "outdent",
            tab: "indent"
        },
        toolbarSelector: "[data-role=editor-toolbar]",
        commandRole: "edit",
        activeToolbarClass: "btn-info",
        selectionMarker: "edit-focus-marker",
        selectionColor: "darkgrey",
        dragAndDropImages: true,
        fileUploadError: function(d, c) {
            console.log("File upload error", d, c)
        }
    }
} (window.jQuery));