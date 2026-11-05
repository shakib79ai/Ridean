// Saved addresses — board "SavedAddresses". Mirrors apps/pwa/src/app/account/addresses/page.tsx.
// The API has no update endpoint, so each row offers delete instead of the design's edit pencil.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../api/api_client.dart';
import '../../api/models.dart';
import '../../state/providers.dart';
import '../../theme.dart';
import '../../widgets/kit.dart';

const _labels = ['Home', 'Work', 'Other'];

IconData _labelIcon(String label) {
  final l = label.trim().toLowerCase();
  if (l == 'home') return Icons.home_outlined;
  if (l == 'work' || l == 'office') return Icons.work_outline_rounded;
  if (l.contains('airport') || l.contains('terminal')) return Icons.flight_outlined;
  return Icons.star_outline_rounded;
}

class SavedAddressesScreen extends ConsumerStatefulWidget {
  const SavedAddressesScreen({super.key});
  @override
  ConsumerState<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends ConsumerState<SavedAddressesScreen> {
  final _search = TextEditingController();
  final _custom = TextEditingController();
  final _address = TextEditingController();
  bool _adding = false;
  String _kind = 'Home';
  String _busy = '';
  String _error = '';

  @override
  void dispose() {
    _search.dispose();
    _custom.dispose();
    _address.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    final label = _kind == 'Other' ? _custom.text.trim() : _kind;
    final address = _address.text.trim();
    if (label.isEmpty) {
      setState(() => _error = 'Give this place a name, e.g. “Gym”.');
      return;
    }
    if (address.length < 3) {
      setState(() => _error = 'Please enter the full address.');
      return;
    }
    setState(() {
      _error = '';
      _busy = 'add';
    });
    try {
      await ref.read(apiProvider).addAddress(label, address);
      if (!mounted) return;
      ref.invalidate(addressesProvider);
      _address.clear();
      _custom.clear();
      setState(() => _adding = false);
      showRdToast(context, 'Address saved');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  Future<void> _remove(SavedAddress a) async {
    final ok = await rdConfirm(context, title: 'Delete address', message: 'Delete “${a.label}”?', confirm: 'Delete', danger: true);
    if (!ok || !mounted) return;
    setState(() {
      _error = '';
      _busy = a.id;
    });
    try {
      await ref.read(apiProvider).deleteAddress(a.id);
      if (!mounted) return;
      ref.invalidate(addressesProvider);
      showRdToast(context, 'Address removed');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = errorText(e));
    } finally {
      if (mounted) setState(() => _busy = '');
    }
  }

  @override
  Widget build(BuildContext context) {
    final list = ref.watch(addressesProvider);
    final q = _search.text.trim().toLowerCase();

    final body = rdAsync<List<SavedAddress>>(list, (data) {
      if (data.isEmpty) {
        return const RdEmpty(icon: Icons.location_on_outlined, title: 'No saved places yet', text: 'Add home or work for faster booking.');
      }
      final items = data.where((a) => q.isEmpty || a.label.toLowerCase().contains(q) || a.address.toLowerCase().contains(q)).toList();
      if (items.isEmpty) {
        return RdEmpty(icon: Icons.search_rounded, title: 'No matches', text: 'No saved address matches “${_search.text.trim()}”.');
      }
      return RdListGroup(children: [
        for (final a in items)
          _AddressRow(
            address: a,
            onDelete: _busy.isNotEmpty ? null : () => _remove(a),
          ),
      ]);
    }, onRetry: () => ref.invalidate(addressesProvider), loadingHeight: 240);

    return RdPage(
      title: 'Saved addresses',
      onRefresh: () => ref.refresh(addressesProvider.future),
      children: [
        _SearchBox(controller: _search, onChanged: (_) => setState(() {})),
        body,
        if (_adding)
          RdCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: rdGap([
                RdChips<String>(
                  options: [for (final l in _labels) (l, l)],
                  value: _kind,
                  onChanged: (v) => setState(() => _kind = v),
                ),
                if (_kind == 'Other')
                  RdField(
                    label: 'Name',
                    icon: Icons.star_outline_rounded,
                    controller: _custom,
                    hint: 'e.g. Gym, Mum’s place',
                    maxLength: 60,
                    textCapitalization: TextCapitalization.words,
                    textInputAction: TextInputAction.next,
                  ),
                RdField(
                  label: 'Address',
                  icon: Icons.location_on_outlined,
                  controller: _address,
                  hint: 'Street, city, postcode',
                  autofillHints: const [AutofillHints.fullStreetAddress],
                  textCapitalization: TextCapitalization.words,
                  textInputAction: TextInputAction.done,
                  onSubmitted: (_) => _add(),
                ),
                if (_error.isNotEmpty) RdErrorText(_error),
                Row(children: [
                  Expanded(
                    child: RdOutlineButton(
                      label: 'Cancel',
                      height: 54,
                      onPressed: _busy == 'add'
                          ? null
                          : () => setState(() {
                                _adding = false;
                                _error = '';
                              }),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(flex: 2, child: RdCta(label: 'Save address', arrow: false, busy: _busy == 'add', onPressed: _add)),
                ]),
              ], 12),
            ),
          )
        else ...[
          if (_error.isNotEmpty) RdErrorText(_error),
          RdCta(
            label: 'Add new address',
            arrow: false,
            onPressed: () => setState(() {
              _adding = true;
              _error = '';
            }),
          ),
        ],
      ],
    );
  }
}

class _SearchBox extends StatelessWidget {
  const _SearchBox({required this.controller, required this.onChanged});
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(color: RdColors.card, borderRadius: BorderRadius.circular(12), border: Border.all(color: RdColors.line)),
      child: Row(children: [
        const Icon(Icons.search_rounded, size: 19, color: RdColors.muted),
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
              hintText: 'Search your saved addresses',
              hintStyle: RdText.sans(14.5, color: RdColors.muted),
            ),
          ),
        ),
      ]),
    );
  }
}

class _AddressRow extends StatelessWidget {
  const _AddressRow({required this.address, required this.onDelete});
  final SavedAddress address;
  final VoidCallback? onDelete;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 2),
      child: Row(children: [
        RdIconTile(_labelIcon(address.label)),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(address.label, maxLines: 1, overflow: TextOverflow.ellipsis, style: RdText.sans(15, weight: FontWeight.w500)),
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(address.address, maxLines: 2, overflow: TextOverflow.ellipsis, style: RdText.sans(12.5, color: RdColors.muted)),
            ),
          ]),
        ),
        SizedBox(
          width: 36,
          height: 36,
          child: IconButton(
            padding: EdgeInsets.zero,
            onPressed: onDelete,
            tooltip: 'Delete ${address.label}',
            icon: const Icon(Icons.delete_outline_rounded, size: 19, color: RdColors.muted),
          ),
        ),
      ]),
    );
  }
}
