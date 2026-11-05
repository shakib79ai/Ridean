import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

/// Same support address the PWA uses (the PWA lists no phone number, so there is no "Call us").
const _supportEmail = 'support@ridean.com';

final _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

class _Faq {
  const _Faq(this.q, this.a);
  final String q, a;
}

const _faqs = <_Faq>[
  _Faq('How do I cancel a booking?',
      'Open Trips, choose the booking and tap Cancel booking. Most bookings can be cancelled free of charge up to 1 hour before pickup. The exact cancellation policy is shown on each quote before you book, and on your booking afterwards.'),
  _Faq('Where will my chauffeur meet me at the airport?',
      'Airport transfers include Meet & Greet: your chauffeur waits in the arrivals hall with a name sign. Add your flight number when you book and the pickup follows your flight if it lands early or late. Your chauffeur’s details appear on your booking once they are assigned.'),
  _Faq('How is my price calculated?',
      'Every price is upfront. We ask our partner suppliers to quote for your exact trip and show you the total before you book — no surge after you book. Promo codes can be added at checkout.'),
  _Faq('When is my card charged?',
      'Your card is authorised when you book, so the amount is held but not taken. It is charged when the partner confirms your booking. If a booking cannot be confirmed, the hold is released.'),
  _Faq('Can I book for someone else?', 'Yes. Enter the passenger’s name, email and phone number at checkout and the booking details go to them.'),
  _Faq('How does the Ridean wallet work?',
      'Top up your wallet from the Wallet tab, then choose to pay with your wallet balance at checkout. Your balance and every top-up and payment are listed on the Wallet tab.'),
  _Faq('How do business accounts work?',
      'Set up Ridean Business from your account, invite your team and set a travel policy. Trips booked on the business account are billed monthly, and invoices are available under Invoices in your account.'),
  _Faq('I forgot my password or can’t sign in',
      'Password reset by email isn’t available yet. Email us at $_supportEmail from the address on your account and we’ll help you get back in. Once signed in, you can change your password, edit your profile and delete your account from Settings.'),
];

const _topics = <(String, String)>[
  ('Booking', 'Booking'),
  ('Payment', 'Payment'),
  ('Account', 'Account'),
  ('Other', 'Other'),
];

String _tripTitle(Booking b) {
  final d = b.dropoff;
  if (d != null && d.isNotEmpty) return d;
  final parts = [b.vehicle.name, b.supplierName].where((p) => p.isNotEmpty).toList();
  return parts.isEmpty ? b.serviceLabel : parts.join(' · ');
}

class HelpScreen extends ConsumerStatefulWidget {
  const HelpScreen({super.key});
  @override
  ConsumerState<HelpScreen> createState() => _HelpScreenState();
}

class _HelpScreenState extends ConsumerState<HelpScreen> {
  final _search = TextEditingController();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  String _query = '';
  String _topic = 'Booking';
  bool _sending = false;
  String _error = '';

  @override
  void initState() {
    super.initState();
    final u = ref.read(authProvider).user;
    if (u != null) {
      _name.text = u.fullName;
      _email.text = u.email;
    }
  }

  @override
  void dispose() {
    _search.dispose();
    _name.dispose();
    _email.dispose();
    _message.dispose();
    super.dispose();
  }

  Future<void> _copyEmail() async {
    try {
      await Clipboard.setData(const ClipboardData(text: _supportEmail));
      if (!mounted) return;
      showRdToast(context, 'Email address copied');
    } catch (_) {
      if (!mounted) return;
      showRdToast(context, 'Couldn’t copy — please try again');
    }
  }

  Future<void> _emailUs() async {
    var opened = false;
    try {
      opened = await launchUrl(Uri(scheme: 'mailto', path: _supportEmail, queryParameters: {'subject': 'Ridean support'}));
    } catch (_) {
      opened = false;
    }
    if (!opened) await _copyEmail();
  }

  Future<void> _send() async {
    if (_sending) return;
    final name = _name.text.trim();
    final email = _email.text.trim();
    final message = _message.text.trim();
    String err = '';
    if (name.isEmpty) {
      err = 'Please enter your name.';
    } else if (!_emailRe.hasMatch(email)) {
      err = 'Please enter a valid email address.';
    } else if (message.length < 5) {
      err = 'Please tell us a little more (at least 5 characters).';
    }
    if (err.isNotEmpty) {
      setState(() => _error = err);
      return;
    }
    setState(() {
      _error = '';
      _sending = true;
    });
    try {
      await ref.read(apiProvider).contact(name: name, email: email, topic: _topic, message: message);
      if (!mounted) return;
      _message.clear();
      setState(() => _sending = false);
      FocusScope.of(context).unfocus();
      showRdToast(context, 'Message sent — we’ll reply by email');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _sending = false;
        _error = errorText(e);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    Booking? recent;
    if (user != null) {
      final list = ref.watch(bookingsProvider).valueOrNull;
      if (list != null && list.isNotEmpty) {
        final sorted = [...list]..sort((a, b) => b.createdAt.compareTo(a.createdAt));
        recent = sorted.first;
      }
    }
    final r = recent;
    String recentSub = 'Changes, cancellations, receipts';
    if (r != null) {
      final when = parseDate(r.pickupAt ?? r.createdAt);
      recentSub = '${r.serviceLabel} · ${_tripTitle(r)}${when == null ? '' : ', ${DateFormat('d MMM').format(when)}'}';
    }

    final words = _query.toLowerCase().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    final searching = words.isNotEmpty;
    final shown = searching ? _faqs.where((f) => words.every('${f.q} ${f.a}'.toLowerCase().contains)).toList() : _faqs;

    final faqRows = <Widget>[];
    for (var i = 0; i < shown.length; i++) {
      if (i > 0) faqRows.add(const Divider(height: 1, color: RdColors.line));
      faqRows.add(_FaqTile(key: ValueKey('${shown[i].q}-$searching'), faq: shown[i], initiallyOpen: searching));
    }

    return RdPage(
      title: 'Help & support',
      children: [
        _SearchBox(
          controller: _search,
          onChanged: (v) => setState(() => _query = v),
          onClear: () {
            _search.clear();
            setState(() => _query = '');
          },
        ),
        IntrinsicHeight(
          child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Expanded(child: _ContactCard(icon: Icons.mail_outline, title: 'Email us', subtitle: _supportEmail, onTap: _emailUs, onLongPress: _copyEmail)),
            const SizedBox(width: 10),
            Expanded(child: _ContactCard(icon: Icons.description_outlined, title: 'Invoices', subtitle: 'Download receipts', onTap: () => context.push('/account/invoices'))),
          ]),
        ),
        RdListGroup(children: [
          RdListTile(
            icon: Icons.receipt_outlined,
            title: 'Help with a recent trip',
            subtitle: recentSub,
            onTap: () {
              if (r != null) {
                context.push('/bookings/${r.id}');
              } else {
                context.go('/trips');
              }
            },
          ),
        ]),
        RdSectionTitle(searching ? 'Results for “${_query.trim()}”' : 'Common questions'),
        RdCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
          child: shown.isEmpty
              ? Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 2),
                  child: Text('No answers match your search. Email us at $_supportEmail or send us a message below and we’ll help.',
                      style: RdText.sans(13.5, color: RdColors.muted, height: 1.5)),
                )
              : Column(children: faqRows),
        ),
        const RdSectionTitle('Send us a message'),
        RdCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            RdChips<String>(options: _topics, value: _topic, onChanged: (v) => setState(() => _topic = v)),
            const SizedBox(height: 14),
            RdInput(label: 'Name', controller: _name, autofillHints: const [AutofillHints.name], textCapitalization: TextCapitalization.words, textInputAction: TextInputAction.next),
            const SizedBox(height: 12),
            RdInput(label: 'Email', controller: _email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], textInputAction: TextInputAction.next),
            const SizedBox(height: 12),
            RdInput(label: 'Message', controller: _message, hint: 'How can we help?', maxLines: 5, maxLength: 4000, textCapitalization: TextCapitalization.sentences),
            if (_error.isNotEmpty) ...[const SizedBox(height: 12), RdErrorText(_error)],
            const SizedBox(height: 16),
            RdCta(label: 'Send message', icon: Icons.send_outlined, arrow: false, busy: _sending, onPressed: _send),
          ]),
        ),
      ],
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox({required this.controller, required this.onChanged, required this.onClear});
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final VoidCallback onClear;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
      child: Row(children: [
        const Icon(Icons.search, size: 19, color: RdColors.muted),
        const SizedBox(width: 10),
        Expanded(
          child: TextField(
            controller: controller,
            onChanged: onChanged,
            textInputAction: TextInputAction.search,
            style: RdText.sans(14.5),
            cursorColor: RdColors.gold,
            decoration: InputDecoration(
              isDense: true,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              filled: false,
              contentPadding: EdgeInsets.zero,
              hintText: 'Search help articles',
              hintStyle: RdText.sans(14.5, color: RdColors.muted),
            ),
          ),
        ),
        if (controller.text.isNotEmpty)
          GestureDetector(onTap: onClear, child: Text('Clear', style: RdText.sans(13, weight: FontWeight.w600, color: RdColors.gold))),
      ]),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({required this.icon, required this.title, required this.subtitle, required this.onTap, this.onLongPress});
  final IconData icon;
  final String title, subtitle;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        onLongPress: onLongPress,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(16), border: Border.all(color: RdColors.line)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, size: 22, color: RdColors.gold),
            const SizedBox(height: 8),
            Text(title, style: RdText.sans(14.5, weight: FontWeight.w600)),
            const SizedBox(height: 4),
            Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(12, color: RdColors.muted)),
          ]),
        ),
      ),
    );
  }
}

class _FaqTile extends StatefulWidget {
  const _FaqTile({super.key, required this.faq, this.initiallyOpen = false});
  final _Faq faq;
  final bool initiallyOpen;
  @override
  State<_FaqTile> createState() => _FaqTileState();
}

class _FaqTileState extends State<_FaqTile> {
  late bool _open = widget.initiallyOpen;
  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: InkWell(
        onTap: () => setState(() => _open = !_open),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              Expanded(child: Text(widget.faq.q, style: RdText.sans(14.5))),
              const SizedBox(width: 10),
              AnimatedRotation(
                turns: _open ? .5 : 0,
                duration: const Duration(milliseconds: 200),
                child: const Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: RdColors.muted),
              ),
            ]),
            AnimatedSize(
              duration: const Duration(milliseconds: 200),
              alignment: Alignment.topCenter,
              child: _open
                  ? Padding(padding: const EdgeInsets.only(top: 10), child: Text(widget.faq.a, style: RdText.sans(13.5, color: RdColors.muted, height: 1.5)))
                  : const SizedBox(width: double.infinity),
            ),
          ]),
        ),
      ),
    );
  }
}
