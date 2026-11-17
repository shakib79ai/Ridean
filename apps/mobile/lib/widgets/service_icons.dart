import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Solid Ridean service glyphs. Same paths as the website and PWA (packages/web-core/src/icons.tsx).
enum ServiceGlyph { ride, airport, rent }

const _paths = {
  ServiceGlyph.ride: '<path fill-rule="evenodd" d="M1.6 15.4v-2.1c0-.6.3-1 .9-1.2l3.9-.6 2.5-2.4c.4-.4.9-.6 1.5-.6h3.9c.6 0 1.1.2 1.5.6l2.3 2.2 3.3.6c.7.1 1.2.7 1.2 1.4v2.1c0 .4-.3.7-.7.7h-1.6a2.6 2.6 0 0 0-5.1 0H9.2a2.6 2.6 0 0 0-5.1 0H2.3c-.4 0-.7-.3-.7-.7zM7.7 11.4h3.6V9.6h-1.4c-.3 0-.6.1-.8.3zm4.6 0h4.2l-1.7-1.5c-.2-.2-.5-.3-.8-.3h-1.7z"/><path fill-rule="evenodd" d="M6.65 14.3a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zm0 1.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6zM17.35 14.3a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zm0 1.3a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"/>',
  ServiceGlyph.airport: '<path transform="rotate(45 12 12)" d="M21 15.6v-1.9l-7.6-4.7V3.9c0-.8-.6-1.4-1.4-1.4s-1.4.6-1.4 1.4V9L3 13.7v1.9l7.6-2.4v5.1l-1.9 1.4v1.4L12 20.2l3.3.9v-1.4l-1.9-1.4v-5.1z"/>',
  ServiceGlyph.rent: '<path fill-rule="evenodd" d="M15.9 7.2 14.7 3.8c-.2-.5-.7-.9-1.3-.9H5.6c-.6 0-1.1.4-1.3.9L2.6 8.6v6.6c0 .5.4.9.9.9h.9c.5 0 .9-.4.9-.9v-.9h8.4v.9c0 .5.4.9.9.9h.9c.5 0 .9-.4.9-.9V9.2zM5.4 12.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm8.3 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zM4.3 8.1l1.1-3.3h8.3l1.1 3.3z"/><path fill-rule="evenodd" d="M17.8 11.2a3.4 3.4 0 0 0-3.2 4.5l-2.9 2.9v2.2h2.2v-1.3h1.3v-1.3h1.3l.6-.6a3.4 3.4 0 1 0 .7-6.4zm.9 2.1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>',
};

class ServiceIcon extends StatelessWidget {
  const ServiceIcon(this.glyph, {super.key, this.size = 20, this.color});
  final ServiceGlyph glyph;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = color ?? IconTheme.of(context).color ?? Colors.white;
    return SvgPicture.string(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000000">${_paths[glyph]}</svg>',
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(c, BlendMode.srcIn),
    );
  }
}
